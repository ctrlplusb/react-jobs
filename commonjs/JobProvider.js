'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createJobContext = require('./createJobContext');

var _createJobContext2 = _interopRequireDefault(_createJobContext);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var JobProvider = function (_Component) {
  _inherits(JobProvider, _Component);

  function JobProvider() {
    _classCallCheck(this, JobProvider);

    return _possibleConstructorReturn(this, (JobProvider.__proto__ || Object.getPrototypeOf(JobProvider)).apply(this, arguments));
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
            var rehydration = _this2.rehydrateState.jobs[id];
            delete _this2.rehydrateState.jobs[id];
            return rehydration;
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
  children: _react.PropTypes.node.isRequired,
  jobContext: _react.PropTypes.shape({
    getNextId: _react.PropTypes.func.isRequired,
    register: _react.PropTypes.func.isRequired,
    get: _react.PropTypes.func.isRequired,
    getState: _react.PropTypes.func.isRequired
  }),
  rehydrateState: _react.PropTypes.shape({
    jobs: _react.PropTypes.object.isRequired
  })
};
JobProvider.defaultProps = {
  jobContext: null,
  rehydrateState: {
    jobs: {}
  }
};
JobProvider.childContextTypes = {
  jobs: _react.PropTypes.shape({
    getNextId: _react.PropTypes.func.isRequired,
    register: _react.PropTypes.func.isRequired,
    get: _react.PropTypes.func.isRequired,
    getRehydrate: _react2.default.PropTypes.func.isRequired,
    removeRehydrate: _react2.default.PropTypes.func.isRequired
  }).isRequired
};
exports.default = JobProvider;