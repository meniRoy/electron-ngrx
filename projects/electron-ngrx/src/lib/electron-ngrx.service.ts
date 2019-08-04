import {Injectable, NgZone} from '@angular/core';
import {WindowCommunicationService} from './window-communication.service';
import {Action, Store} from '@ngrx/store';
import {merge} from 'rxjs';


@Injectable()
export class ElectronNgrxService {
  constructor(ngZone: NgZone, private store: Store<any>, private windowCommunicationService: WindowCommunicationService) {
    merge(
      this.windowCommunicationService.listenToChild(),
      this.windowCommunicationService.listenToRoute(),
      this.windowCommunicationService.listenToId())
      .subscribe((action: Action) => {
        ngZone.run(() => this.store.dispatch(action));
      });
  }

  dispatchToParent(action: Action) {
    this.windowCommunicationService.sendToParent(action);
  }

  dispatchToId(action: Action, id: number) {
    this.windowCommunicationService.sendToId(id, action);
  }

  dispatchToRoute(action: Action, route: string) {
    this.windowCommunicationService.sendToRoute(route, action);
  }
}
