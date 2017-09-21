'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = withJob;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _utils = require('./utils');

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
            error: null,
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
              console.warn(error);
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