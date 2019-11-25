import {Component} from '@angular/core';
import {ElectronNgrxService} from 'electron-ngrx';
import {selectCounter} from '../counter/state/counter.reducer';

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
    this.electronNgrxService.selectFromId<number>(parseInt(windowId, 10), selectCounter).subscribe(data => this.counter = data);
  }

  selectCounterFromParent() {
    this.electronNgrxService.selectFromParent<number>(selectCounter).subscribe(data => this.counter = data);
  }

}
