import {Component, OnInit} from '@angular/core';
import {ElectronService} from '../providers/electron.service';
import {ElectronNgrxService} from 'electron-ngrx';
import {decrement} from '../counter/state/counter.actions';

@Component({
  selector: 'app-ipc',
  templateUrl: './ipc.component.html',
  styleUrls: ['./ipc.component.scss']
})
export class IpcComponent implements OnInit {
  winId;
  idToSend;
  routeToSend;

  constructor(
    private electronNgrx: ElectronNgrxService,
    private electronService: ElectronService) {
  }

  ngOnInit() {
    this.winId = this.electronService.remote.getCurrentWindow().id;
  }

  sendToParent() {
    this.electronNgrx.dispatchToParent(decrement());
  }

  sendToRoute() {
    this.electronNgrx.dispatchToRoute(decrement(), this.routeToSend);
  }

  sendToId() {
    this.electronNgrx.dispatchToId(decrement(), this.idToSend);
  }
}
