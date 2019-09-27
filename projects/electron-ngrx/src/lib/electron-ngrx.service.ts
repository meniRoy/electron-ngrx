import {ApplicationRef, Injectable, NgZone} from '@angular/core';
import {Massage, WindowCommunicationService} from './window-communication.service';
import {Action, Store} from '@ngrx/store';
import {merge, Observable} from 'rxjs';
import {filter, finalize, map, mergeMap, share, take} from 'rxjs/operators';
import {getHashFromSelector, getSelectorByHash} from './selector-manager';

const enum ngrxCommend {
  dispatch,
  select
}

interface EvaluationRequest {
  commend: ngrxCommend;
  payload: any;
}

@Injectable()
export class ElectronNgrxService {
  constructor(
    private appRef: ApplicationRef,
    private ngZone: NgZone,
    private store: Store<any>,
    private windowCommunicationService: WindowCommunicationService) {
    const myMassages = merge<Massage<EvaluationRequest>>(
      this.windowCommunicationService.listenToChild(),
      this.windowCommunicationService.listenToRoute(),
      this.windowCommunicationService.listenToId()).pipe(share());
    myMassages.pipe(
      map(massage => massage.data),
      filter(data => data.commend === ngrxCommend.dispatch),
      map(data => data.payload))
      .subscribe((action: Action) => {
        ngZone.run(() => this.store.dispatch(action));
      });
    myMassages.pipe(
      filter(massage => massage.data.commend === ngrxCommend.select),
      mergeMap(massage => {
        const selector = getSelectorByHash(massage.data.payload);
        return this.store.select(selector).pipe(
          take(1),
          map(storeData => ({storeData, replay: massage.reply}))
        );
      })
    ).subscribe(({storeData, replay}) => replay(storeData));
  }

  dispatchToParent(action: Action): void {
    this.windowCommunicationService.sendToParent({commend: ngrxCommend.dispatch, payload: action});
  }

  dispatchToId(action: Action, id: number): void {
    this.windowCommunicationService.sendToId<EvaluationRequest, void>(id, {commend: ngrxCommend.dispatch, payload: action});
  }

  dispatchToRoute(action: Action, route: string): void {
    this.windowCommunicationService.sendToRoute(route, {commend: ngrxCommend.dispatch, payload: action});
  }

  selectFromId<T>(id: number, selector: (...arg: any) => any, triggerCd = true): Observable<T> {
    const hash = getHashFromSelector(selector);
    return this.windowCommunicationService.sendToId<EvaluationRequest, T>(id, {
      commend: ngrxCommend.select,
      payload: hash
    }).pipe(
      // because electron ipc run out of zone.
      finalize(() => triggerCd && this.appRef.tick())
    );
  }

  selectFromParent<T>(selector: (...arg: any) => any, triggerCd = true): Observable<T> {
    const hash = getHashFromSelector(selector);
    return this.windowCommunicationService.sendToParent<EvaluationRequest, T>({
      commend: ngrxCommend.select,
      payload: hash
    }).pipe(
      // because electron ipc run out of zone.
      finalize(() => triggerCd && this.appRef.tick())
    );
  }
}
