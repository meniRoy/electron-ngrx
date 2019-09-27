import {h64} from 'xxhashjs';

type fooType = (...args: any) => any;
const hashFunction = (foo: fooType, identifier: string): string => {
  return h64(foo.name + foo.toString() + identifier, 0xABCD).toString(16);
};
let selectorStorage: Record<string, fooType> = {};
export const registerSelector = (selector, identifier = '') => {
  const hash = hashFunction(selector, identifier);
  if (selectorStorage.hasOwnProperty(hash)) {
    throw new Error(`duplicate selector.\
     the selector: '${selector.name}' Already exist.\
      if you didnt register this selector Already, Maybe you register another selector with the same name.\
       in this case consider to use the second argument in registerSelector as identifier of the selector`);
  }
  selectorStorage[hash] = selector;
  (selector as any).hash = hash;
};
export const getSelectorByHash = (hash: string): fooType => selectorStorage[hash];
export const getHashFromSelector = (foo: fooType): string => (foo as any).hash;
// tslint:disable-next-line:variable-name
export const _resetSelectorStorage = () => selectorStorage = {};
