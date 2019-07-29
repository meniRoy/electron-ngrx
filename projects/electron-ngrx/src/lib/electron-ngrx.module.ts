import {NgModule} from '@angular/core';
import {ElectronNgrxService} from './electron-ngrx.service';
import {WindowCommunicationService} from './window-communication.service';

@NgModule({
  providers: [ElectronNgrxService, WindowCommunicationService]
})
export class ElectronNgrxModule {
}
