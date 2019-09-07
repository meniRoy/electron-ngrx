import {Component} from '@angular/core';
import {Store, select, createFeatureSelector} from '@ngrx/store';
import {Observable} from 'rxjs';
import {increment, decrement, reset} from './state/counter.actions';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
})
export class CounterComponent {
  count$: Observable<number>;

  constructor(private store: Store<{ count: number }>) {
    this.count$ = store.pipe(select('count'));
    (window as any).a = createFeatureSelector('feature');
  }

  increment() {
    this.store.dispatch(increment());
  }

  decrement() {
    this.store.dispatch(decrement());
  }

  reset() {
    this.store.dispatch(reset());
  }
}
