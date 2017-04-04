'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = rehydrateJobs;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ClientProvider = require('./ClientProvider');

var _ClientProvider2 = _interopRequireDefault(_ClientProvider);

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function rehydrateJobs(app) {
  return new Promise(function (resolve) {
    var appWithJobs = _react2.default.createElement(
      _ClientProvider2.default,
      { ssrState: window[_constants.STATE_IDENTIFIER] },
      app
    );
    resolve({ appWithJobs: appWithJobs });
  });
}