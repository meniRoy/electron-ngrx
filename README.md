# ElectronNgrx
[![Build Status](https://travis-ci.com/meniRoy/electron-ngrx.svg?branch=master)](https://travis-ci.com/meniRoy/electron-ngrx)
[![codecov](https://codecov.io/gh/meniRoy/electron-ngrx/branch/master/graph/badge.svg)](https://codecov.io/gh/meniRoy/electron-ngrx)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
![npm](https://img.shields.io/npm/v/electron-ngrx?style=flat-square)

## Motivation
Synchronizing multiple Electron windows to a single state or in some cases multiple states is a difficult task which results in complex management and repetitive code.

Implementing such a communication solution for multiple windows that transfer a decent amount of data between them takes a lot of effort, especially if you have multiple states that are shared.
Basically you will find yourself building a rest API.

### The solution
ElectronNgrx offers an easy to use solution. It seamlessly dispatches actions and selects data from states across multiple windows.

##Usge:
ElectronNgrx delivers an Angular service with the following methods:

`dispatchToParent` - Dispatch NGRX action to the window parent.

`dispatchToId` - Dispatch NGRX action to a specific Electron window that matches the given id.

`dispatchToRoute` - Dispatch NGRX action to all windows on the specific route.

`selectFromId` - select data from the state of the window that matches the given id.  

`selectFromParent` - select data from parent window state. 

## change detection
By default NgZone isn't aware of the ipc electron.
This may cause issues when messages from electron ipc are received and the change detection isn't triggered.
ElectronNgrx takes care of this problem by triggering the Angular change detection after every action that affects the window such as dispatching an action received from another window or receiving data from another window's state.

## example
Dispatch increment action to the parent window's state.
```typescript
export class ChildWindowComponent {
 
  constructor(private electronNgrxService: ElectronNgrxService) {
  }

  increaseCounterOnParentWindow(increaseBy) {
    this.electronNgrxService.dispatchToParent(incrementAction({paylaod: increaseBy}));
  }
}
```
ElectronNgrx will dispatch the action to the parent window's state, assuring that the Angular change detection will be triggered on the parent window.
## Demo

To clone and run the demo you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/meniRoy/electron-ngrx.git
# Go into the repository
cd electron-ngrx
# Install dependencies
npm install
# Run the the demo
npm start
```
