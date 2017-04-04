'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.getDisplayName = getDisplayName;

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

var isPromise = exports.isPromise = function isPromise(x) {
  return (typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object' && typeof x.then === 'function';
};

var propsWithoutInternal = function propsWithoutInternal(props) {
  // eslint-disable-next-line no-unused-vars
  var jobInitState = props.jobInitState,
      onJobProcessed = props.onJobProcessed,
      rest = _objectWithoutProperties(props, ['jobInitState', 'onJobProcessed']);

  return rest;
};
exports.propsWithoutInternal = propsWithoutInternal;