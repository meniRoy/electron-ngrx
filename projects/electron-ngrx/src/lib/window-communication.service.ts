import {Injectable} from '@angular/core';
import {fromEvent, Observable} from 'rxjs';
import {filter, map, startWith, withLatestFrom} from 'rxjs/operators';
import {NavigationEnd, Router} from '@angular/router';

@Injectable()
export class WindowCommunicationService {
  ipcRenderer;
  remote;

  constructor(private router: Router) {
    const electron = (window as any).require('electron');
    this.ipcRenderer = electron.ipcRenderer;
    this.remote = electron.remote;
  }

  listenToChild() {
    return fromEvent(this.ipcRenderer, 'send-to-parent')
      .pipe(map(this.stripData));
  }

  listenToId() {
    return fromEvent(this.ipcRenderer, 'send-to-id')
      .pipe(map(this.stripData));
  }

  listenToRoute() {
    return fromEvent(this.remote.ipcMain, 'send-to-route').pipe(
      map(this.stripData),
      withLatestFrom(this.getWindowRoute(), (data, url) => ({data, url})),
      filter(({url, data}) => url === data.url),
      map(({data}) => data.payload)
    );
  }

  private stripData([event, data]) {
    return data;
  }

  private getWindowRoute(): Observable<string> {
    return this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e: NavigationEnd) => e.url),
      startWith(this.router.url)
    );
  }

  sendToRoute(route, data) {
    this.ipcRenderer.send('send-to-route', {url: route, payload: data});
  }


  sendToParent(data) {
    this.remote.getCurrentWindow().getParentWindow().webContents.send('send-to-parent', data);
  }

  sendToId(id, data) {
    this.remote.BrowserWindow.fromId(parseInt(id, 10)).webContents.send('send-to-id', data);
  }
}
