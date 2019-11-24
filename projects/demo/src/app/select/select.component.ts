import {Component} from '@angular/core';
import {ElectronNgrxService} from 'electron-ngrx';
import {selectCounter} from '../counter/state/counter.reducer';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent {
  selectFrom: 'id' | 'parent' = 'id';
  counter$: Observable<number>;

  constructor(private electronNgrxService: ElectronNgrxService) {
  }

  selectCounterFromWindow(windowId: string) {
    this.counter$ = this.electronNgrxService.selectFromId<number>(parseInt(windowId), selectCounter);
  }

  selectCounterFromParent() {
    const counter$1 = this.electronNgrxService.selectFromParent<number>(selectCounter);
    counter$1.subscribe(data => console.log('fds', data));
    this.counter$ = counter$1;
  }

}
