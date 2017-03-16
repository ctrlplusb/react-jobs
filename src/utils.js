/*  */

export function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}

export const isPromise = x =>
  typeof x === 'object' && typeof x.then === 'function'

export const propsWithoutInternal = (props) => {
  // eslint-disable-next-line no-unused-vars
  const { jobInitState, onJobProcessed, ...rest } = props
  return rest
}
