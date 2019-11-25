import {ApplicationRef, Injectable, NgZone} from '@angular/core';
import {WindowCommunicationService} from './window-communication.service';
import {Action, select, Store} from '@ngrx/store';
import {merge, Observable} from 'rxjs';
import {filter, finalize, map, mergeMap, share, take} from 'rxjs/operators';
import {getSelectorHash, getSelectorByHash, selectorFunction} from './selector-manager';
import {MessageWithReplay} from '../models/message';

const enum ngrxCommand {
  dispatch,
  select
}

interface EvaluationRequest {
  command: ngrxCommand;
  payload: any;
}

@Injectable()
export class ElectronNgrxService {
  constructor(
    private appRef: ApplicationRef,
    private ngZone: NgZone,
    private store: Store<any>,
    private windowCommunicationService: WindowCommunicationService) {
    const myMessages = merge<MessageWithReplay<EvaluationRequest>>(
      this.windowCommunicationService.listenToParentChannel(),
      this.windowCommunicationService.listenToRouteChannel(),
      this.windowCommunicationService.listenToIdChannel()).pipe(share());
    myMessages.pipe(
      map(message => message.data),
      filter(data => data.command === ngrxCommand.dispatch),
      map(data => data.payload))
      .subscribe((action: Action) => {
        ngZone.run(() => this.store.dispatch(action));
      });
    myMessages.pipe(
      filter(message => message.data.command === ngrxCommand.select),
      mergeMap(message => {
        const selector = getSelectorByHash(message.data.payload);
        return this.store.pipe(
          select(selector),
          take(1),
          map(storeData => ({storeData, replay: message.replay}))
        );
      })
    ).subscribe(({storeData, replay}) => replay(storeData));
  }

  dispatchToParent(action: Action): void {
    this.windowCommunicationService.sendToParent({command: ngrxCommand.dispatch, payload: action});
  }

  dispatchToId(action: Action, id: number): void {
    this.windowCommunicationService.sendToId<EvaluationRequest, void>(id, {command: ngrxCommand.dispatch, payload: action});
  }

  dispatchToRoute(action: Action, route: string): void {
    this.windowCommunicationService.sendToRoute(route, {command: ngrxCommand.dispatch, payload: action});
  }

  selectFromId<T>(id: number, selector: selectorFunction, triggerChangeDetection = true): Observable<T> {
    return this.selectFromWindow<T>((data) => this.windowCommunicationService.sendToId(id, data), selector, triggerChangeDetection);
  }

  selectFromParent<T>(selector: selectorFunction, triggerChangeDetection = true): Observable<T> {
    return this.selectFromWindow<T>(
      (data: EvaluationRequest) => this.windowCommunicationService.sendToParent(data), selector, triggerChangeDetection);
  }

  private selectFromWindow<T>(communicationFunction: (data: EvaluationRequest) => Observable<T>,
                              selector: selectorFunction,
                              triggerChangeDetection: boolean) {
    const hash = getSelectorHash(selector);
    return communicationFunction({
      command: ngrxCommand.select,
      payload: hash
    }).pipe(
      // because electron ipc run out of zone.
      finalize(() => triggerChangeDetection && this.appRef.tick())
    );
  }
}
