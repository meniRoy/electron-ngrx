import {Injectable} from '@angular/core';
import {fromEvent, Observable} from 'rxjs';
import {filter, map, pluck, share, take, withLatestFrom} from 'rxjs/operators';
import {NavigationEnd, Router} from '@angular/router';
import {ipcRenderer, remote} from 'electron';
import {channel} from './communication-channels';
import {MessageWithReplay} from '../models/message';

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

  constructor(private router: Router) {
    const electron = (window as any).require('electron');
    this.ipcRenderer = electron.ipcRenderer;
    this.remote = electron.remote;
    this.myId = electron.remote.getCurrentWindow().id;
    this.replay = fromEvent(this.ipcRenderer, channel.replay).pipe(map(this.extractDataFromEvent), share());
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
    this.remote.getCurrentWindow().getParentWindow().webContents.send(channel.parent, {
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
}
