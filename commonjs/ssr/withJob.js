'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; // @see https://github.com/facebook/react/issues/1137

// eslint-disable-next-line import/no-extraneous-dependencies


exports.default = withJob;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _utils = require('../utils');

var _withJob = require('../withJob');

var _withJob2 = _interopRequireDefault(_withJob);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var defaultConfig = {
  defer: false
};

var getInitialState = function getInitialState(context, jobID, defer) {
  var reactJobsClient = context.reactJobsClient,
      reactJobsServer = context.reactJobsServer;


  if (defer) {
    return { completed: false, inProgress: true };
  }

  if (reactJobsServer) {
    // Running on the server. If the jobs have been executed by the runJobs
    // helper then we will get back a result here.
    var jobState = reactJobsServer.getJobState(jobID);
    if (jobState) {
      return jobState;
    }
  } else {
    // Otherwise we have to be on the browser. Check if there is any
    // rehydration state available for this job.
    var ssrRehydrateState = reactJobsClient.popJobRehydrationForSRR(jobID);
    if (ssrRehydrateState) {
      return ssrRehydrateState;
    }
  }

  return undefined;
};

function withSSRBehaviour(WrappedComponent, config) {
  var jobIDHandle = null;

  var _ref = config || defaultConfig,
      defer = _ref.defer;

  var ComponentWithJobID = function ComponentWithJobID(props, context) {
    var reactJobsClient = context.reactJobsClient,
        reactJobsServer = context.reactJobsServer;

    // Establish a unique identifier for this job instance.

    var getJobID = function getJobID() {
      if (!jobIDHandle) {
        jobIDHandle = reactJobsClient.nextJobID();
      }
      return jobIDHandle;
    };
    var jobID = getJobID();

    // Determine if we have an state from server side processing or
    // client side rehdration.
    var initialState = getInitialState(context, jobID, defer);

    // When on a server we want to call back and register the result of the
    // work so that the server can hydrate the app appropriately as well
    // as provide the initial state to be sent to the browser.
    var onJobProcessed = reactJobsServer ? function (jobsState) {
      return reactJobsServer.registerJobState(jobID, jobsState);
    } : null;

    return _react2.default.createElement(WrappedComponent, _extends({}, props, {
      jobInitState: initialState,
      onJobProcessed: onJobProcessed
    }));
  };
  ComponentWithJobID.displayName = (0, _utils.getDisplayName)(WrappedComponent) + 'WithJobID';
  ComponentWithJobID.contextTypes = {
    reactJobsClient: _react.PropTypes.object.isRequired,
    reactJobsServer: _react.PropTypes.object
  };
  return ComponentWithJobID;
}

function withJob(work, config) {
  return function wrapComponentWithSSRJob(Component) {
    // eslint-disable-next-line no-unused-vars
    var _ref2 = config || defaultConfig,
        defer = _ref2.defer,
        rest = _objectWithoutProperties(_ref2, ['defer']);
    // We wrap the standard job implementation with our SSR behaviour.


    return withSSRBehaviour((0, _withJob2.default)(work, rest)(Component), config);
  };
}