import {Injectable} from '@angular/core';
import {fromEvent, Observable} from 'rxjs';
import {filter, map, pluck, share, take, withLatestFrom} from 'rxjs/operators';
import {NavigationEnd, Router} from '@angular/router';
import {ipcRenderer, remote} from 'electron';

interface WithSender {
  data: any;
  senderId: number;
  massageId: number;
}

export interface Massage<T> {
  reply: (...arg: any) => void;
  data: T;
}

export const enum chancels {
  replay = 'replay',
  route = 'route',
  id = 'id',
  parent = 'parent'
}

@Injectable()
export class WindowCommunicationService {
  ipcRenderer: typeof ipcRenderer;
  remote: typeof remote;
  private readonly myId: number;
  private reply: Observable<any>;

  constructor(private router: Router) {
    const electron = (window as any).require('electron');
    this.ipcRenderer = electron.ipcRenderer;
    this.remote = electron.remote;
    this.myId = electron.remote.getCurrentWindow().id;
    this.reply = fromEvent(this.ipcRenderer, chancels.replay).pipe(map(this.fromElectronMassage), share());
  }

  listenToChild<T>(): Observable<Massage<T>> {
    return this.listenIpcRenderer<T>(chancels.parent);
  }

  listenToId<T>(): Observable<Massage<T>> {
    return this.listenIpcRenderer<T>(chancels.id);
  }

  listenToRoute<T>(): Observable<{ data: T }> {
    return fromEvent(this.remote.ipcMain, chancels.route).pipe(
      map<any, { route: string, data: T }>(this.fromElectronMassage),
      withLatestFrom(this.getWindowRoute(), (massage, myRoute) => ({massage, myRoute})),
      filter(({myRoute, massage}) => myRoute === massage.route),
      map(({massage}) => ({data: massage.data})),
    );
  }


  sendToRoute<T>(route: string, data: T): void {
    this.ipcRenderer.send(chancels.route, {data, route});
  }

  sendToParent<T, R>(data: T): Observable<R> {
    const massageId = +new Date();
    this.remote.getCurrentWindow().getParentWindow().webContents.send(chancels.parent, {
      data,
      senderId: this.myId,
      massageId
    });
    return this.getReplyByMassageId<R>(massageId);
  }


  sendToId<T, R>(id: number, data: T): Observable<R> {
    const massageId = +new Date();
    this.sendById(chancels.id, id, {data, senderId: this.myId, massageId});
    return this.getReplyByMassageId<R>(massageId);
  }

  private fromElectronMassage<T>([event, data]: [Event, T]): T {
    return data;
  }

  private withReply<T>(massage: WithSender): Massage<T> {
    return {
      data: massage.data,
      reply: (replyMassage: any) => this.sendById(chancels.replay, massage.senderId, {data: replyMassage, massageId: massage.massageId})
    };
  }

  private getWindowRoute(): Observable<string> {
    return this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e: NavigationEnd) => e.url),
    );
  }

  private getReplyByMassageId<T>(massageId): Observable<T> {
    return this.reply.pipe(filter(massage => massage.massageId === massageId), pluck('data'), take(1));
  }

  private sendById(chanel: string, id: number, data): void {
    this.remote.BrowserWindow.fromId(id).webContents.send(chanel, data);
  }

  private listenIpcRenderer<T>(eventName: string): Observable<Massage<T>> {
    return fromEvent(this.ipcRenderer, eventName)
      .pipe(
        map<any, WithSender>(this.fromElectronMassage),
        map((data) => this.withReply<T>(data))
      );
  }
}
