/* @flow */

export function getDisplayName(WrappedComponent : Function) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export const isPromise = (x : any) => typeof x === 'object' && typeof x.then === 'function';
