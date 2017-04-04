'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _enzyme = require('enzyme');

var _ClientProvider = require('../ClientProvider');

var _ClientProvider2 = _interopRequireDefault(_ClientProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('<ClientProvider />', function () {
  describe('context', function () {
    it('should provide a unique number for every nextJobID() execution', function () {
      var actualJobID1 = void 0;
      var actualJobID2 = void 0;
      var Foo = function Foo(props, context) {
        actualJobID1 = context.reactJobsClient.nextJobID();
        actualJobID2 = context.reactJobsClient.nextJobID();
        return _react2.default.createElement(
          'div',
          null,
          'foo'
        );
      };
      Foo.contextTypes = { reactJobsClient: _react.PropTypes.object.isRequired };
      var app = _react2.default.createElement(
        _ClientProvider2.default,
        null,
        _react2.default.createElement(Foo, null)
      );
      (0, _enzyme.mount)(app);
      expect(actualJobID1).toEqual(1);
      expect(actualJobID2).toEqual(2);
    });
  });
});

// Under test.