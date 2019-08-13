# ElectronNgrx
[![Build Status](https://travis-ci.com/meniRoy/electron-ngrx.svg?branch=master)](https://travis-ci.com/meniRoy/electron-ngrx)
[![codecov](https://codecov.io/gh/meniRoy/electron-ngrx/branch/master/graph/badge.svg)](https://codecov.io/gh/meniRoy/electron-ngrx)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

**ElectronNgrx** is a library for dispatching NGRX actions between different Electron windows on a multi-window Electron Apps.

The library supports the following API methods:

`dispatchToParent` - Dispatch NGRX action data through the window's parent.

`dispatchToId`  - Dispatch NGRX action data to a specific Electron window by providing the destination window's ID.

`dispatchToRoute`  - Dispatch NGRX action data to a specific Route providing the destination route's details.



## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.
