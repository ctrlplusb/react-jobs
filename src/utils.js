/* @flow */
/* eslint-disable import/prefer-default-export */

export function getDisplayName(WrappedComponent : Function) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
