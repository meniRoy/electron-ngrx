import {TestBed} from '@angular/core/testing';
import {chancels, WindowCommunicationService} from './window-communication.service';
import {NavigationEnd, Router} from '@angular/router';
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
    expect(subscriber).toHaveBeenCalledWith({data, reply: jasmine.any(Function)});
  });

  it('should send to window by id', () => {
    const service: WindowCommunicationService = TestBed.get(WindowCommunicationService);
    const subscriber = jasmine.createSpy();
    const data = 'data';
    const windowId = 1;
    defineEventEmitterToWindowId(windowId, electronMock.ipcRenderer);
    service.listenToId().subscribe(subscriber);
    service.sendToId(windowId, data);
    expect(subscriber).toHaveBeenCalledWith({data, reply: jasmine.any(Function)});
  });

  it('should send to route', (done) => {
    const service: WindowCommunicationService = TestBed.get(WindowCommunicationService);
    const mockData = 'data';

    service.listenToRoute().subscribe(({data}) => {
      expect(data).toBe(mockData);
      done();
    });
    routerEvents.next(new NavigationEnd(1, '/', ''));
    service.sendToRoute('/', mockData);
  });
  describe('should send replay massage', () => {
    const windowId = 1;
    const massageId = 2;
    const replyData = 'reply';

    it('when id chanel emit massage', (done) => {
      const service: WindowCommunicationService = TestBed.get(WindowCommunicationService);
      defineEventEmitterToWindowId(windowId, electronMock.ipcRenderer);
      electronMock.ipcRenderer.once(chancels.replay, (event, data) => {
        expect(data).toEqual({data: replyData, massageId});
        done();
      });
      service.listenToId().subscribe((massage) => {
        massage.reply(replyData);
      });
      electronMock.ipcRenderer.emit(chancels.id, [{}, {data: null, senderId: windowId, massageId}]);
    });

    it('when parent chanel emit massage', (done) => {
      const service: WindowCommunicationService = TestBed.get(WindowCommunicationService);
      defineEventEmitterToWindowId(windowId, electronMock.ipcRenderer);
      electronMock.ipcRenderer.once(chancels.replay, (event, data) => {
        expect(data).toEqual({data: replyData, massageId});
        done();
      });
      service.listenToChild().subscribe((massage) => {
        massage.reply(replyData);
      });
      electronMock.ipcRenderer.emit(chancels.parent, [{}, {data: null, senderId: windowId, massageId}]);
    });

  });

  it('should return replay massage', (done) => {
    const service: WindowCommunicationService = TestBed.get(WindowCommunicationService);
    const windowId = 1;
    const replayData = 'replay';
    defineEventEmitterToWindowId(windowId, electronMock.ipcRenderer);
    electronMock.ipcRenderer.once(chancels.id, (event, data) =>
      setTimeout(() => electronMock.ipcRenderer.emit(chancels.replay, [{}, {data: replayData, massageId: data.massageId}]))
    );
    service.sendToId(windowId, {}).subscribe((data) => {
      expect(data).toBe(replayData);
      done();
    });
  });

});
