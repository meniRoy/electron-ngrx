# ElectronNgrx
[![Build Status](https://travis-ci.com/meniRoy/electron-ngrx.svg?branch=master)](https://travis-ci.com/meniRoy/electron-ngrx)
[![codecov](https://codecov.io/gh/meniRoy/electron-ngrx/branch/master/graph/badge.svg)](https://codecov.io/gh/meniRoy/electron-ngrx)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
![npm](https://img.shields.io/npm/v/electron-ngrx?style=flat-square)

## Motivation
Most everyone who has worked with multiple Electron windows knows that it requires tons of repetitive coding. 

The ones who tried to get to multiple windows to communicate a decent amount of information between them, then go and basically have to end up building a rest API.
….No one wants that.

### The solution
ElectronNgrx offers an easy to use solution. It seamlessly dispatches actions and selects data from state's across multiple windows.

##Usge:
electronNgrx returns an Angular service with these functions

`dispatchToParent` - Dispatch NGRX action to the window's parent.

`dispatchToId` - Dispatch NGRX action to a specific Electron window by providing the destination window ID.

`dispatchToRoute` - Dispatch NGRX action to all window’s on the specific route.

`selectFromId` - select data from the state of a different window with the window ID provided.  

`selectFromParent` - select data from parent window state. 


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
