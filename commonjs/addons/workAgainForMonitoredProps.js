'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /* eslint-disable import/no-extraneous-dependencies */

// $FlowIgnore


var _shallowEqual = require('fbjs/lib/shallowEqual');

var _shallowEqual2 = _interopRequireDefault(_shallowEqual);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var getMonitorState = function getMonitorState(props, monitorProps) {
  return monitorProps.reduce(function (acc, cur) {
    var dotNot = cur.split('.');
    if (dotNot.length > 1) {
      var obj = props[dotNot[0]];

      var _dotNot$reduce = dotNot.reduce(function (a, c) {
        return Object.assign({}, a, {
          path: a.path.concat('' + (a.path !== '' ? '.' : '') + c),
          value: (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && typeof obj[c] !== 'undefined' ? obj[c] : null,
          obj: (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && _typeof(obj[c]) === 'object' ? obj[c] : null
        });
      }, { path: '', value: null, obj: obj }),
          path = _dotNot$reduce.path,
          value = _dotNot$reduce.value;

      return Object.assign(acc, _defineProperty({}, path, value));
    }
    return Object.assign(acc, _defineProperty({}, cur, props[cur]));
  }, {});
};

module.exports = function workAgainForMonitoredProps(monitorProps) {
  var validArgs = monitorProps && Array.isArray(monitorProps) && monitorProps.length > 0;

  if (!validArgs) {
    throw new Error('You must provide at least one prop for the workAgainForMonitoredProps');
  }

  var monitorState = null;

  return function (prevProps, nextProps) {
    if (monitorState === null) {
      // This is likely the first time the "shouldWorkAgain" is being hit.
      // Lets initialise our monitor state with the previous props.
      monitorState = getMonitorState(prevProps, monitorProps);
    }
    var prevState = monitorState;
    monitorState = getMonitorState(nextProps, monitorProps);
    return prevState === null || !(0, _shallowEqual2.default)(prevState, monitorState);
  };
};