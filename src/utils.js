/* @flow */

export function getDisplayName(WrappedComponent : Function) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export const isPromise = (x : any) => typeof x === 'object' && typeof x.then === 'function';

export const propsWithoutInternal = (props : Object) => {
  // eslint-disable-next-line no-unused-vars
  const { jobInitState, onJobProcessed, ...rest } = props;
  return rest;
};
