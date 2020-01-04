import {Injectable} from '@angular/core';
import {fromEvent, Observable, Subject, Subscription} from 'rxjs';
import {filter, first, map, pluck, share, shareReplay, switchMap, take, takeUntil, withLatestFrom} from 'rxjs/operators';
import {NavigationEnd, Router} from '@angular/router';
import {ipcRenderer, remote, BrowserWindow} from 'electron';
import {channel} from './communication-channels';
import {MessageWithReplay} from '../models/message';
import {SubscriptionCommand} from './subscription-command';

interface Message {
  data: any;
  senderId: number;
  messageId: number;
}

@Injectable()
export class WindowCommunicationService {
  private static messagesCounter = 0;
  private ipcRenderer: typeof ipcRenderer;
  private remote: typeof remote;
  private readonly myId: number;
  private replay: Observable<any>;
  private parentWindow: BrowserWindow;
  subscription: Observable<{}>;

  constructor(private router: Router) {
    const electron = (window as any).require('electron');
    this.ipcRenderer = electron.ipcRenderer;
    this.remote = electron.remote;
    this.myId = electron.remote.getCurrentWindow().id;
    this.parentWindow = this.remote.getCurrentWindow().getParentWindow();
    this.replay = fromEvent(this.ipcRenderer, channel.replay).pipe(map(this.extractDataFromEvent), share());
    this.subscription = fromEvent(this.ipcRenderer, channel.subscription).pipe(map(this.extractDataFromEvent));
  }

  generateMessageId(): number {
    return Number(this.myId + '' + WindowCommunicationService.messagesCounter++);
  }

  listenToParentChannel<T>(): Observable<MessageWithReplay<T>> {
    return this.listenToIpcRenderer<T>(channel.parent);
  }

  listenToIdChannel<T>(): Observable<MessageWithReplay<T>> {
    return this.listenToIpcRenderer<T>(channel.id);
  }

  listenToRouteChannel<T>(): Observable<{ data: T }> {
    return fromEvent(this.remote.ipcMain, channel.route).pipe(
      map<any, { route: string, data: T }>(this.extractDataFromEvent),
      withLatestFrom(this.getWindowRoute(), (message, myRoute) => ({message, myRoute})),
      filter(({myRoute, message}) => myRoute === message.route),
      map(({message}) => ({data: message.data})),
    );
  }


  sendToRoute<T>(route: string, data: T): void {
    this.ipcRenderer.send(channel.route, {data, route});
  }

  sendToParent<T, R>(data: T): Observable<R> {
    const messageId = this.generateMessageId();
    this.parentWindow.webContents.send(channel.parent, {
      data,
      senderId: this.myId,
      messageId
    });
    return this.getReplayByMessageId<R>(messageId);
  }


  sendToId<T, R>(windowId: number, data: T): Observable<R> {
    const messageId = this.generateMessageId();
    this.sendToWindow(channel.id, windowId, {data, senderId: this.myId, messageId});
    return this.getReplayByMessageId<R>(messageId);
  }

  listenSubscriptionRequest<T>() {
    return this.subscription.pipe(map((message: { data: T, messageId: number, senderId: number }) => ({
      data: message.data,
      response: (observable: Observable<any>) => {
        const channelPrefix = channel.subscription + message.messageId;
        const cleanup = new Subject();
        this.onWindowClose(this.remote.BrowserWindow.fromId(message.senderId)).subscribe(cleanup);
        this.observableToChanelSubscription(channelPrefix, cleanup, observable, message.senderId);
        this.sendToWindow(channelPrefix, message.senderId, {type: SubscriptionCommand.listening});
      }
    })), share());
  }

  private observableToChanelSubscription(channelPrefix, cleanup, srcObservable: Observable<any>, windowId: number) {
    let subscription: Subscription;
    fromEvent(this.ipcRenderer, channelPrefix).pipe(map(this.extractDataFromEvent), takeUntil(cleanup))
      .subscribe((command: { type: SubscriptionCommand }) => {
        if (command.type === SubscriptionCommand.subscribe) {
          subscription = srcObservable.pipe(takeUntil(cleanup)).subscribe(
            (data) => this.sendToWindow(channelPrefix, windowId, {type: SubscriptionCommand.next, data}),
            (error) => this.sendToWindow(channelPrefix, windowId, {type: SubscriptionCommand.error, data: error}),
            () => this.sendToWindow(channelPrefix, windowId, {type: SubscriptionCommand.complete})
          );
        } else if (command.type === SubscriptionCommand.unsubscribe) {
          subscription.unsubscribe();
        }
      });
  }

  subscribeToParent<T, R>(data: T): Observable<R> {
    return this.subscribeToWindow<T, R>(this.parentWindow, data);
  }

  subscribeToWindowById<T, R>(id: number, data: T): Observable<R> {
    return this.subscribeToWindow<T, R>(this.remote.BrowserWindow.fromId(id), data);
  }

  private subscribeToWindow<T, R>(window: BrowserWindow, data: T): Observable<R> {
    const messageId = this.generateMessageId();
    const channelPrefix = channel.subscription + messageId;
    const waitForWindowToListen = this.waitForWindowToListen(window, channelPrefix);
    window.webContents.send(channel.subscription, {data, messageId, senderId: this.myId});
    return waitForWindowToListen.pipe(switchMap(this.chanelSubscriptionToObservable<R>(window, channelPrefix)), share());
  }


  private chanelSubscriptionToObservable<T>(window: Electron.BrowserWindow, channelPrefix): () => Observable<T> {
    return () => new Observable((subscriber) => {
      const cleanup = new Subject();
      this.onWindowClose(window).pipe(takeUntil(cleanup)).subscribe(() => {
        subscriber.complete();
        cleanup.next();
      });
      fromEvent(this.ipcRenderer, channelPrefix)
        .pipe(map(this.extractDataFromEvent), takeUntil(cleanup))
        .subscribe((messageData: { type: SubscriptionCommand, data: any }) => {
            if (messageData.type === SubscriptionCommand.complete) {
              subscriber.complete();
              cleanup.complete();
            } else if (messageData.type === SubscriptionCommand.next) {
              subscriber.next(messageData.data);
            } else if (messageData.type === SubscriptionCommand.error) {
              subscriber.error(messageData.data);
            }
          }
        );
      window.webContents.send(channelPrefix, {type: SubscriptionCommand.subscribe});
      return () => {
        window.webContents.send(channelPrefix, SubscriptionCommand.unsubscribe);
        cleanup.next();
      };
    });
  }

  private extractDataFromEvent<T>([event, data]: [Event, T]): T {
    return data;
  }

  private addReplayToMessage<T>(message: Message): MessageWithReplay<T> {
    return {
      data: message.data,
      replay: (replayMessage: any) =>
        this.sendToWindow(channel.replay, message.senderId, {data: replayMessage, messageId: message.messageId})
    };
  }

  private getWindowRoute(): Observable<string> {
    return this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e: NavigationEnd) => e.url),
    );
  }

  private getReplayByMessageId<T>(messageId): Observable<T> {
    return this.replay.pipe(filter(message => message.messageId === messageId), pluck('data'), take(1));
  }

  private sendToWindow(chanel: string, id: number, data): void {
    this.remote.BrowserWindow.fromId(id).webContents.send(chanel, data);
  }

  private listenToIpcRenderer<T>(eventName: string): Observable<MessageWithReplay<T>> {
    return fromEvent(this.ipcRenderer, eventName)
      .pipe(
        map<any, Message>(this.extractDataFromEvent),
        map((data) => this.addReplayToMessage<T>(data))
      );
  }

  private onWindowClose(window: BrowserWindow): Observable<any> {
    return fromEvent(window, 'closed').pipe(first());
  }

  private waitForWindowToListen(window: BrowserWindow, channelPrefix: string) {
    const waitForWindowToListen = fromEvent(this.ipcRenderer, channelPrefix).pipe(
      map(this.extractDataFromEvent),
      filter((data: { type: string }) => data.type === 'listening'),
      first(),
      shareReplay()
    );
    waitForWindowToListen.subscribe();
    return waitForWindowToListen;
  }
}
