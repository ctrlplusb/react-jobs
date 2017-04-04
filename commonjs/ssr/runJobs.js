'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = runJobs;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactTreeWalker = require('react-tree-walker');

var _reactTreeWalker2 = _interopRequireDefault(_reactTreeWalker);

var _utils = require('../utils');

var _ServerProvider = require('./ServerProvider');

var _ServerProvider2 = _interopRequireDefault(_ServerProvider);

var _createRunJobsExecContext = require('./createRunJobsExecContext');

var _createRunJobsExecContext2 = _interopRequireDefault(_createRunJobsExecContext);

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getJobs(rootElement, rootContext) {
  var fetchRoot = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  var jobs = [];

  (0, _reactTreeWalker2.default)(rootElement, function (element, instance, context) {
    var skipRoot = !fetchRoot && element === rootElement;
    if (instance && typeof instance.getExecutingJob === 'function' && !skipRoot) {
      var job = instance.getExecutingJob();
      if ((0, _utils.isPromise)(job)) {
        jobs.push({ job: job, element: element, context: context });

        // Tell walkTree to not recurse inside this component;  we will
        // wait for the query to execute before attempting it.
        return false;
      }
    }

    return undefined;
  }, rootContext);

  return jobs;
}

function runJobs(rootElement) {
  var rootContext = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var isRoot = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  var processingElement = void 0;
  if (isRoot) {
    var runJobsExecContext = (0, _createRunJobsExecContext2.default)();
    rootContext.runJobsExecContext = runJobsExecContext; // eslint-disable-line no-param-reassign
    processingElement = _react2.default.createElement(
      _ServerProvider2.default,
      { runJobsExecContext: runJobsExecContext },
      rootElement
    );
  } else {
    processingElement = rootElement;
  }

  var resolveResult = function resolveResult() {
    return {
      appWithJobs: processingElement,
      state: rootContext.runJobsExecContext.getState(),
      STATE_IDENTIFIER: _constants.STATE_IDENTIFIER
    };
  };

  var runningJobs = getJobs(processingElement, rootContext, isRoot)
  // Map over the jobs and then...
  .map(function (_ref) {
    var job = _ref.job,
        element = _ref.element,
        context = _ref.context;
    return (
      // ... make sure they will continue executing jobs for their Children
      // when they are complete.
      job.then(function () {
        return runJobs(element, context,
        // We've just grabbed the job for element so don't try and get it again
        false);
      })
    );
  });

  return runningJobs.length > 0 ? Promise.all(runningJobs)
  // Swallow errors.
  .catch(function () {
    return undefined;
  }).then(function () {
    return resolveResult();
  }) : Promise.resolve(resolveResult());
}