export interface MessageWithReplay<T> {
  replay: (...arg: any) => void;
  data: T;
}
