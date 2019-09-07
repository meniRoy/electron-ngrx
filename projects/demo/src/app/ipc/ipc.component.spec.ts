import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IpcComponent } from './ipc.component';

describe('IpcComponent', () => {
  let component: IpcComponent;
  let fixture: ComponentFixture<IpcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IpcComponent ]
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
