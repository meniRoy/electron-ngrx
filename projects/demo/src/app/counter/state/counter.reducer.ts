import {createReducer, on} from '@ngrx/store';
import {increment, decrement, reset} from './counter.actions';
import {registerSelector} from 'electron-ngrx';

export const initialState = 0;

export const counterReducer = createReducer(initialState,
  on(increment, state => state + 1),
  on(decrement, state => state - 1),
  on(reset, () => 0),
);

export const selectCounter = (state) => state.count;
registerSelector(selectCounter);
