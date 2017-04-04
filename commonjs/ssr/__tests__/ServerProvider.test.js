'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _enzyme = require('enzyme');

var _ServerProvider = require('../ServerProvider');

var _ServerProvider2 = _interopRequireDefault(_ServerProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('<ServerProvider />', function () {
  describe('context', function () {
    it('should allow registering/fetching of job state', function () {
      var expected = { completed: true, inProgress: false, result: 'foo' };
      var actual = void 0;
      var jobID = 1;
      var Foo = function Foo(props, context) {
        context.reactJobsServer.registerJobState(jobID, expected);
        actual = context.reactJobsServer.getJobState(jobID);
        return _react2.default.createElement(
          'div',
          null,
          'foo'
        );
      };
      Foo.contextTypes = { reactJobsServer: _react.PropTypes.object.isRequired };
      var app = _react2.default.createElement(
        _ServerProvider2.default,
        null,
        _react2.default.createElement(Foo, null)
      );
      (0, _enzyme.mount)(app);
      expect(actual).toMatchObject(expected);
    });
  });
});

// Under test.