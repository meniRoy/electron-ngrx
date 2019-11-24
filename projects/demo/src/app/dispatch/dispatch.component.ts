import {Component} from '@angular/core';
import {ElectronNgrxService} from 'electron-ngrx';
import {decrement, increment} from '../counter/state/counter.actions';

@Component({
  selector: 'app-dispatch',
  templateUrl: './dispatch.component.html',
  styleUrls: ['./dispatch.component.scss']
})
export class DispatchComponent {
  destinationWindId;
  destinationWindRoute;

  constructor(
    private electronNgrx: ElectronNgrxService) {
  }

  sendToParent(action: string) {
    action === 'increment' ? this.electronNgrx.dispatchToParent(increment()) : this.electronNgrx.dispatchToParent(decrement());
  }

  sendToRoute(action: string) {
    this.electronNgrx.dispatchToRoute(action === 'increment' ? increment() : decrement(), this.destinationWindRoute);
  }

  sendToId(action: string) {
    this.electronNgrx.dispatchToId(action === 'increment' ? increment() : decrement(), parseInt(this.destinationWindId, 10));
  }
}
