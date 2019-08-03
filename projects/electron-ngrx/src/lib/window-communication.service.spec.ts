import {TestBed} from '@angular/core/testing';
import {WindowCommunicationService} from './window-communication.service';
import {Router} from '@angular/router';
import {Subject} from 'rxjs';
import {defineEventEmitterToWindowId, getElectronMock} from './electron.mock';


describe('window communication service', () => {
  let electronMock;
  let routerEvents;

  beforeEach(() => {
    routerEvents = new Subject();
    electronMock = getElectronMock();
    (window as any).require = () => electronMock;
    TestBed.configureTestingModule({
      providers: [WindowCommunicationService, {provide: Router, useValue: {url: '/', events: routerEvents}}],
    });
  });

  it('should be created', () => {
    const service: WindowCommunicationService = TestBed.get(WindowCommunicationService);
    expect(service).toBeTruthy();
  });

  it('should send to parent', () => {
    const service: WindowCommunicationService = TestBed.get(WindowCommunicationService);
    const subscriber = jasmine.createSpy();
    const data = 'data';

    service.listenToChild().subscribe(subscriber);
    service.sendToParent(data);
    expect(subscriber).toHaveBeenCalledWith(data);
  });

  it('should send to id', () => {
    const service: WindowCommunicationService = TestBed.get(WindowCommunicationService);
    const subscriber = jasmine.createSpy();
    const data = 'data';
    const windowId = 1;
    defineEventEmitterToWindowId(1, electronMock.ipcRenderer);
    service.listenToId().subscribe(subscriber);
    service.sendToId(windowId, data);
    expect(subscriber).toHaveBeenCalledWith(data);
  });

  it('should send to route', (done) => {
    const service: WindowCommunicationService = TestBed.get(WindowCommunicationService);
    const mockData = 'data';

    service.listenToRoute().subscribe((data) => {
      expect(data).toBe(mockData);
      done();
    });
    service.sendToRoute('/', mockData);
  });

});
