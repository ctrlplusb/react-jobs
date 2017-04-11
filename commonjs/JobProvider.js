'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _createJobContext = require('./createJobContext');

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
    getRehydrate: _react2.default.PropTypes.func.isRequired,
    removeRehydrate: _react2.default.PropTypes.func.isRequired
  }).isRequired
};
exports.default = JobProvider;