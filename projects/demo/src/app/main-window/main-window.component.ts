import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-main-window',
  templateUrl: './main-window.component.html',
  styleUrls: ['./main-window.component.scss']
})
export class MainWindowComponent implements OnInit {

  ngOnInit(): void {
    window.resizeTo(800, 700);
  }
}
