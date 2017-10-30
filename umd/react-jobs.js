(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"), require("prop-types"));
	else if(typeof define === 'function' && define.amd)
		define(["react", "prop-types"], factory);
	else if(typeof exports === 'object')
		exports["ReactJobs"] = factory(require("react"), require("prop-types"));
	else
		root["ReactJobs"] = factory(root["React"], root["PropTypes"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createJobContext;
function createJobContext() {
  var idPointer = 0;
  var jobs = {};
  return {
    getNextId: function getNextId() {
      idPointer += 1;
      return idPointer;
    },
    resetIds: function resetIds() {
      idPointer = 0;
    },
    register: function register(jobID, result) {
      jobs[jobID] = result;
    },
    get: function get(jobID) {
      return jobs[jobID];
    },
    getState: function getState() {
      return { jobs: jobs };
    }
  };
}

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createJobContext = exports.JobProvider = exports.withJob = undefined;

var _withJob = __webpack_require__(4);

var _withJob2 = _interopRequireDefault(_withJob);

var _JobProvider = __webpack_require__(6);

var _JobProvider2 = _interopRequireDefault(_JobProvider);

var _createJobContext = __webpack_require__(2);

var _createJobContext2 = _interopRequireDefault(_createJobContext);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.withJob = _withJob2.default;
exports.JobProvider = _JobProvider2.default;
exports.createJobContext = _createJobContext2.default;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = withJob;

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _utils = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var validSSRModes = ['resolve', 'defer', 'boundary'];
var neverWorkAgain = function neverWorkAgain() {
  return false;
};

function withJob(config) {
  if ((typeof config === 'undefined' ? 'undefined' : _typeof(config)) !== 'object') {
    throw new Error('You must provide a config object to withJob');
  }

  var work = config.work,
      LoadingComponent = config.LoadingComponent,
      ErrorComponent = config.ErrorComponent,
      _config$serverMode = config.serverMode,
      serverMode = _config$serverMode === undefined ? 'resolve' : _config$serverMode,
      _config$shouldWorkAga = config.shouldWorkAgain,
      shouldWorkAgain = _config$shouldWorkAga === undefined ? neverWorkAgain : _config$shouldWorkAga;


  if (typeof work !== 'function') {
    throw new Error('You must provide a work function to withJob');
  }

  if (validSSRModes.indexOf(serverMode) === -1) {
    throw new Error('Invalid serverMode provided to asyncComponent');
  }

  var env = typeof window === 'undefined' ? 'node' : 'browser';

  return function wrapWithJob(WrappedComponent) {
    var id = void 0;

    var ComponentWithJob = function (_Component) {
      _inherits(ComponentWithJob, _Component);

      function ComponentWithJob(props, context) {
        _classCallCheck(this, ComponentWithJob);

        // Each instance needs it's own id as that is how we expect work to
        // be executed.  It is not shared between element instances.
        var _this = _possibleConstructorReturn(this, (ComponentWithJob.__proto__ || Object.getPrototypeOf(ComponentWithJob)).call(this, props, context));

        _initialiseProps.call(_this);

        if (context.jobs) {
          id = context.jobs.getNextId();
        }
        return _this;
      }

      // @see react-async-bootstrapper


      _createClass(ComponentWithJob, [{
        key: 'asyncBootstrap',
        value: function asyncBootstrap() {
          if (env === 'browser') {
            // No logic for browser, just continue
            return true;
          }

          // node
          return serverMode === 'defer' ? false : this.resolveWork(this.props);
        }
      }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
          var result = void 0;

          if (this.context.jobs) {
            result = env === 'browser' ? this.context.jobs.getRehydrate(id) : this.context.jobs.get(id);
          }

          this.setState({
            data: result ? result.data : null,
            error: result ? result.error : null,
            completed: result != null
          });
        }
      }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
          if (!this.state.completed) {
            this.resolveWork(this.props);
          }

          if (this.context.jobs && env === 'browser') {
            this.context.jobs.removeRehydrate(id);
          }
        }
      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          this.unmounted = true;
        }
      }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
          if (shouldWorkAgain((0, _utils.propsWithoutInternal)(this.props), (0, _utils.propsWithoutInternal)(nextProps), this.getJobState())) {
            this.resolveWork(nextProps);
          }
        }
      }, {
        key: 'render',
        value: function render() {
          var _state = this.state,
              data = _state.data,
              error = _state.error,
              completed = _state.completed;

          if (error) {
            return ErrorComponent ? _react2.default.createElement(ErrorComponent, _extends({}, this.props, { error: error })) : null;
          }
          if (!completed) {
            return LoadingComponent ? _react2.default.createElement(LoadingComponent, this.props) : null;
          }
          return _react2.default.createElement(WrappedComponent, _extends({}, this.props, { jobResult: data }));
        }
      }]);

      return ComponentWithJob;
    }(_react.Component);

    ComponentWithJob.displayName = 'WithJob(' + (0, _utils.getDisplayName)(WrappedComponent) + ')';
    ComponentWithJob.contextTypes = {
      jobs: _propTypes2.default.shape({
        getNextId: _propTypes2.default.func.isRequired,
        register: _propTypes2.default.func.isRequired,
        get: _propTypes2.default.func.isRequired,
        getRehydrate: _propTypes2.default.func.isRequired,
        removeRehydrate: _propTypes2.default.func.isRequired
      })
    };

    var _initialiseProps = function _initialiseProps() {
      var _this2 = this;

      this.resolveWork = function (props) {
        var workDefinition = void 0;

        _this2.setState({ completed: false, data: null, error: null });

        try {
          workDefinition = work(props);
        } catch (error) {
          _this2.setState({ completed: true, error: error });
          // Ensures asyncBootstrap stops
          return false;
        }

        if ((0, _utils.isPromise)(workDefinition)) {
          // Asynchronous result.
          return workDefinition.then(function (data) {
            if (_this2.unmounted) {
              return undefined;
            }
            _this2.setState({ completed: true, data: data });
            if (_this2.context.jobs) {
              _this2.context.jobs.register(id, { data: data });
            }
            // Ensures asyncBootstrap continues
            return true;
          }).catch(function (error) {
            if (_this2.unmounted) {
              return undefined;
            }
            if (env === 'browser') {
              setTimeout(function () {
                if (!_this2.unmounted) {
                  _this2.setState({ completed: true, error: error });
                }
              }, 16);
            } else {
              // node
              // We will at least log the error so that user isn't completely
              // unaware of an error occurring.
              // eslint-disable-next-line no-console
              console.warn('Failed to resolve job');
              // eslint-disable-next-line no-console
              console.warn(error.message);
              // eslint-disable-next-line no-console
              console.warn(error.stack);
              if (_this2.context.jobs) {
                _this2.context.jobs.register(id, {
                  error: {
                    message: error.message,
                    stack: error.stack
                  }
                });
              }
            }
            // Ensures asyncBootstrap stops
            return false;
          });
        }

        // Synchronous result.
        _this2.setState({ completed: true, data: workDefinition, error: null });

        // Ensures asyncBootstrap continues
        return true;
      };

      this.getJobState = function () {
        return {
          completed: _this2.state.completed,
          error: _this2.state.error,
          data: _this2.state.data
        };
      };
    };

    return ComponentWithJob;
  };
}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _createJobContext = __webpack_require__(2);

var _createJobContext2 = _interopRequireDefault(_createJobContext);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var JobProvider = function (_Component) {
  _inherits(JobProvider, _Component);

  function JobProvider(props, context) {
    _classCallCheck(this, JobProvider);

    // This is a workaround because each element instance of a job needs its
    // own ids.  So between the bootstrapping and the render we need to reset
    // the id counter to ensure the ids will match.
    var _this = _possibleConstructorReturn(this, (JobProvider.__proto__ || Object.getPrototypeOf(JobProvider)).call(this, props, context));

    if (props.jobContext) {
      props.jobContext.resetIds();
    }
    return _this;
  }

  _createClass(JobProvider, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.jobContext = this.props.jobContext || (0, _createJobContext2.default)();
      this.rehydrateState = this.props.rehydrateState;
    }
  }, {
    key: 'getChildContext',
    value: function getChildContext() {
      var _this2 = this;

      return {
        jobs: {
          getNextId: this.jobContext.getNextId,
          register: this.jobContext.register,
          get: this.jobContext.get,
          getRehydrate: function getRehydrate(id) {
            return _this2.rehydrateState.jobs[id];
          },
          removeRehydrate: function removeRehydrate(id) {
            delete _this2.rehydrateState.jobs[id];
          }
        }
      };
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.Children.only(this.props.children);
    }
  }]);

  return JobProvider;
}(_react.Component);

JobProvider.propTypes = {
  children: _propTypes2.default.node.isRequired,
  jobContext: _propTypes2.default.shape({
    getNextId: _propTypes2.default.func.isRequired,
    resetIds: _propTypes2.default.func.isRequired,
    register: _propTypes2.default.func.isRequired,
    get: _propTypes2.default.func.isRequired,
    getState: _propTypes2.default.func.isRequired
  }),
  rehydrateState: _propTypes2.default.shape({
    jobs: _propTypes2.default.object.isRequired
  })
};
JobProvider.defaultProps = {
  jobContext: null,
  rehydrateState: {
    jobs: {}
  }
};
JobProvider.childContextTypes = {
  jobs: _propTypes2.default.shape({
    getNextId: _propTypes2.default.func.isRequired,
    register: _propTypes2.default.func.isRequired,
    get: _propTypes2.default.func.isRequired,
    getRehydrate: _propTypes2.default.func.isRequired,
    removeRehydrate: _propTypes2.default.func.isRequired
  }).isRequired
};
exports.default = JobProvider;

/***/ })
/******/ ]);
});