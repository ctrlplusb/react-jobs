/* eslint-disable import/no-extraneous-dependencies */

// $FlowIgnore
import shallowEqual from 'fbjs/lib/shallowEqual'

const getMonitorState = (props, monitorProps) =>
  monitorProps.reduce((acc, cur) => {
    const dotNot = cur.split('.')
    if (dotNot.length > 1) {
      const obj = props[dotNot[0]]
      const { path, value } = dotNot.reduce(
        (a, c) =>
          Object.assign({}, a, {
            path: a.path.concat(`${a.path !== '' ? '.' : ''}${c}`),
            value:
              typeof obj === 'object' && typeof obj[c] !== 'undefined'
                ? obj[c]
                : null,
            obj:
              typeof obj === 'object' && typeof obj[c] === 'object'
                ? obj[c]
                : null,
          }),
        { path: '', value: null, obj },
      )
      return Object.assign(acc, { [path]: value })
    }
    return Object.assign(acc, { [cur]: props[cur] })
  }, {})

module.exports = function workAgainForMonitoredProps(monitorProps) {
  const validArgs =
    monitorProps && Array.isArray(monitorProps) && monitorProps.length > 0

  if (!validArgs) {
    throw new Error(
      'You must provide at least one prop for the workAgainForMonitoredProps',
    )
  }

  let monitorState = null

  return (prevProps, nextProps) => {
    if (monitorState === null) {
      // This is likely the first time the "shouldWorkAgain" is being hit.
      // Lets initialise our monitor state with the previous props.
      monitorState = getMonitorState(prevProps, monitorProps)
    }
    const prevState = monitorState
    monitorState = getMonitorState(nextProps, monitorProps)
    return prevState === null || !shallowEqual(prevState, monitorState)
  }
}
