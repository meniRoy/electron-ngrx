import {registerSelector, getSelectorByHash, getHashFromSelector, _resetSelectorStorage} from './selector-manager';

describe('selector manager', () => {
  afterEach(() => _resetSelectorStorage());
  it('should add hash prop on selector', () => {
    const mockSelector = (state) => state.data;
    registerSelector(mockSelector);
    expect((mockSelector as any).hash).toEqual(jasmine.any(String));
  });

  it('should return different hash for different selector name', () => {
    const mockSelector = (state) => state.data;
    registerSelector(mockSelector);
    const hash = getHashFromSelector(mockSelector);
    const mockSelector2 = (state) => state.data;
    registerSelector(mockSelector2);
    const hash2 = getHashFromSelector(mockSelector2);
    expect(hash).not.toBe(hash2);
  });

  it('should return different hash for different selector', () => {
    let mockSelector = (state) => state.data;
    registerSelector(mockSelector);
    const hash = getHashFromSelector(mockSelector);
    mockSelector = (state) => state.data2;
    registerSelector(mockSelector);
    const hash2 = getHashFromSelector(mockSelector);
    expect(hash).not.toBe(hash2);
  });

  it('should get selector by hash', () => {
    const mockSelector = (state) => state.data;
    registerSelector(mockSelector);
    const hash = getHashFromSelector(mockSelector);
    expect(getSelectorByHash(hash)).toBe(mockSelector);
  });

  it('should throw if the same selector register twice', () => {
    let mockSelector = (state) => state.data;
    registerSelector(mockSelector);
    mockSelector = (state) => state.data;
    expect(() => registerSelector(mockSelector)).toThrow();
  });

  it('should not throw if the same selector register twice but different identifier', () => {
    let mockSelector = (state) => state.data;
    registerSelector(mockSelector);
    mockSelector = (state) => state.data;
    expect(() => registerSelector(mockSelector, 'identifier')).not.toThrow();
  });
});
