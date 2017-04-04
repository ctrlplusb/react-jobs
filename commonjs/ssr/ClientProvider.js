'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // eslint-disable-next-line import/no-extraneous-dependencies


var ClientProvider = function (_Component) {
  _inherits(ClientProvider, _Component);

  function ClientProvider(props) {
    _classCallCheck(this, ClientProvider);

    var _this = _possibleConstructorReturn(this, (ClientProvider.__proto__ || Object.getPrototypeOf(ClientProvider)).call(this, props));

    if (props.ssrState) {
      _this.ssrState = props.ssrState;
    }
    _this.jobCounter = 0;
    return _this;
  }

  _createClass(ClientProvider, [{
    key: 'getChildContext',
    value: function getChildContext() {
      var _this2 = this;

      var context = {
        reactJobsClient: {
          nextJobID: function nextJobID() {
            _this2.jobCounter += 1;
            return _this2.jobCounter;
          },
          popJobRehydrationForSRR: function popJobRehydrationForSRR(jobID) {
            if (_this2.ssrState) {
              var result = _this2.ssrState.jobsState[jobID];
              if (result) {
                delete _this2.ssrState.jobsState[jobID];
                return result;
              }
            }
            return undefined;
          }
        }
      };

      return context;
    }
  }, {
    key: 'render',
    value: function render() {
      return _react.Children.only(this.props.children);
    }
  }]);

  return ClientProvider;
}(_react.Component);

ClientProvider.childContextTypes = {
  reactJobsClient: _react.PropTypes.object.isRequired
};

exports.default = ClientProvider;