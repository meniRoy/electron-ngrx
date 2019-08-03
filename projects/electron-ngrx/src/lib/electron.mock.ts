import createIPCMock from 'electron-mock-ipc';
import {EventEmitter} from 'events';

const windowIdToEventEmitter = {};

export const defineEventEmitterToWindowId = (windowId: number, eventEmitter: EventEmitter) => {
  windowIdToEventEmitter[windowId] = eventEmitter;
};

// this function exist because rxjs from event get only original event emitter
const getIpcAsEmitter = (): { ipcMain: EventEmitter; ipcRenderer: EventEmitter } => {
  const {ipcRenderer: originIpcRenderer, ipcMain: originIpcMain} = createIPCMock();
  (originIpcRenderer.emitter as any).send = originIpcRenderer.send.bind(originIpcRenderer);
  return {ipcRenderer: originIpcRenderer.emitter, ipcMain: originIpcMain.emitter};
};

export const getElectronMock = () => {
  const {ipcRenderer, ipcMain} = getIpcAsEmitter();

  return {
    ipcRenderer,
    remote: {
      ipcMain,
      BrowserWindow: {
        fromId: (id) => ({
          webContents: {send: (event, data) => windowIdToEventEmitter[id].emit(event, null, data)}
        })
      },
      getCurrentWindow: () => ({
        getParentWindow: () => ({
          webContents: {
            send: (evenName, data) => {
              ipcRenderer.emit(evenName, null, data);
            }
          }
        })
      })
    }
  };
};
