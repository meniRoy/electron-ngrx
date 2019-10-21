import 'reflect-metadata';
import '../polyfills';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {AppRoutingModule} from './app-routing.module';
import {ElectronService} from './providers/electron.service';
import {AppComponent} from './app.component';
import {StoreModule} from '@ngrx/store';
import {counterReducer} from './counter/state/counter.reducer';
import {MainWindowComponent} from './main-window/main-window.component';
import {CounterComponent} from './counter/counter.component';
import {NewWindowComponent} from './new-window/new-window.component';
import {IpcComponent} from './ipc/ipc.component';
import {ElectronNgrxModule} from 'electron-ngrx';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';

@NgModule({
  declarations: [
    AppComponent,
    MainWindowComponent,
    IpcComponent,
    NewWindowComponent,
    CounterComponent
  ],
  imports: [
    ElectronNgrxModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    StoreModule.forRoot({count: counterReducer}, {
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
        strictStateSerializability: true,
        strictActionSerializability: true,
      },
    }),
    BrowserAnimationsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule
  ],
  providers: [ElectronService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
