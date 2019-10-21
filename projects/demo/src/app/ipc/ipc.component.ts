import {Component, OnInit} from '@angular/core';
import {ElectronService} from '../providers/electron.service';
import {ElectronNgrxService} from 'electron-ngrx';
import {decrement, increment} from '../counter/state/counter.actions';
import {selectCounter} from '../counter/state/counter.reducer';

@Component({
  selector: 'app-ipc',
  templateUrl: './ipc.component.html',
  styleUrls: ['./ipc.component.scss']
})
export class IpcComponent implements OnInit {
  winId;
  destinationWindId;
  destinationWindRoute;

  constructor(
    private electronNgrx: ElectronNgrxService,
    private electronService: ElectronService) {
  }

  ngOnInit() {
    this.winId = this.electronService.remote.getCurrentWindow().id;
  }

  sendToParent(action: string) {
    action === 'increment' ? this.electronNgrx.dispatchToParent(increment()) : this.electronNgrx.dispatchToParent(decrement());
  }

  sendToRoute(action: string) {
    action === 'increment' ?
      this.electronNgrx.dispatchToRoute(increment(), this.destinationWindRoute) :
      this.electronNgrx.dispatchToRoute(decrement(), this.destinationWindRoute);
  }

  sendToId(action: string) {
    action === 'increment' ?
      this.electronNgrx.dispatchToId(increment(), parseInt(this.destinationWindId, 10)) :
      this.electronNgrx.dispatchToId(decrement(), parseInt(this.destinationWindId, 10));
  }

  selectFromParent() {
    this.electronNgrx.selectFromParent(selectCounter).subscribe(console.log);
  }

  selectFromId() {
    this.electronNgrx.selectFromId(1, selectCounter).subscribe(console.log);
  }
}
