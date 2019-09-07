import {Component, OnInit} from '@angular/core';
import {ElectronService} from '../providers/electron.service';

@Component({
  selector: 'app-new-window',
  templateUrl: './new-window.component.html',
  styleUrls: ['./new-window.component.scss']
})
export class NewWindowComponent implements OnInit {

  constructor(private electronService: ElectronService) {
  }

  ngOnInit() {
  }

  openWindow(route) {
    const BrowserWindow = this.electronService.remote.BrowserWindow;
    const newWin = new BrowserWindow({
      height: 800,
      width: 600,
      webPreferences: {
        nodeIntegration: true,
      },
      parent: this.electronService.remote.getCurrentWindow()
    });
    newWin.loadURL(window.location.origin + route);
  }

}
