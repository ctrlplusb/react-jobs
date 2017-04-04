'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ClientProvider = require('./ClientProvider');

var _ClientProvider2 = _interopRequireDefault(_ClientProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // eslint-disable-next-line import/no-extraneous-dependencies


var ServerProvider = function (_Component) {
  _inherits(ServerProvider, _Component);

  function ServerProvider(props) {
    _classCallCheck(this, ServerProvider);

    var _this = _possibleConstructorReturn(this, (ServerProvider.__proto__ || Object.getPrototypeOf(ServerProvider)).call(this, props));

    if (props.runJobsExecContext) {
      _this.jobStates = props.runJobsExecContext.getState().jobsState;
    } else {
      _this.jobStates = {};
    }
    return _this;
  }

  _createClass(ServerProvider, [{
    key: 'getChildContext',
    value: function getChildContext() {
      var _this2 = this;

      var context = {
        reactJobsServer: {
          registerJobState: function registerJobState(jobID, jobState) {
            _this2.jobStates[jobID] = jobState;
            if (_this2.context.runJobsExecContext) {
              _this2.context.runJobsExecContext.registerJobState(jobID, jobState);
            }
          },
          getJobState: function getJobState(jobID) {
            return _this2.jobStates[jobID];
          }
        }
      };

      return context;
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        _ClientProvider2.default,
        null,
        this.props.children
      );
    }
  }]);

  return ServerProvider;
}(_react.Component);

ServerProvider.contextTypes = {
  reactJobsRunner: _react.PropTypes.object
};
ServerProvider.childContextTypes = {
  reactJobsServer: _react.PropTypes.object.isRequired
};

exports.default = ServerProvider;