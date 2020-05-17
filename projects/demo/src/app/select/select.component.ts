import {Component} from '@angular/core';
import {ElectronNgrxService} from 'electron-ngrx';
import {doubleCounter, tripleCounter} from '../counter/state/counter.reducer';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent {
  selectFrom: 'id' | 'parent' = 'id';
  counter: number;

  constructor(private electronNgrxService: ElectronNgrxService) {
  }

  selectCounterFromWindow(windowId: string) {
    this.electronNgrxService.selectFromId<number>(parseInt(windowId, 10), tripleCounter, {multiplier: 3}).subscribe(data => this.counter = data);
  }

  selectCounterFromParent() {
    this.electronNgrxService.selectFromParent<number>(doubleCounter, {multiplier: 2}).subscribe(data => this.counter = data);
  }

}
