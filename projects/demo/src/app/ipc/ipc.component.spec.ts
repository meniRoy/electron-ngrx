import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {IpcComponent} from './ipc.component';
import {FormsModule} from '@angular/forms';
import {ElectronService} from '../providers/electron.service';
import {ElectronNgrxService} from 'electron-ngrx';

describe('IpcComponent', () => {
  let component: IpcComponent;
  let fixture: ComponentFixture<IpcComponent>;
  const mockWindId = 1;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IpcComponent],
      imports: [FormsModule],
      providers: [
        {provide: ElectronService, useValue: {remote: {getCurrentWindow: () => ({id: mockWindId})}}},
        {provide: ElectronNgrxService, useValue: {}}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IpcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
