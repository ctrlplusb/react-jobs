'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _enzyme = require('enzyme');

var _helpers = require('../../../tools/tests/helpers');

var _ = require('../');

var _ClientProvider = require('../ClientProvider');

var _ClientProvider2 = _interopRequireDefault(_ClientProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('ssr/withJob()', function () {
  (0, _helpers.warningsToErrors)();

  describe('higher order component', function () {
    var hoc = (0, _.withJob)(function () {
      return (0, _helpers.resolveAfter)(1);
    });
    var Actual = hoc(_helpers.Foo);

    it('should return a renderable component', function () {
      expect(function () {
        return (0, _enzyme.mount)(_react2.default.createElement(
          _ClientProvider2.default,
          null,
          _react2.default.createElement(Actual, null)
        ));
      }).not.toThrowError();
    });

    it('should throw when the client provider is not set', function () {
      expect(function () {
        return (0, _enzyme.mount)(_react2.default.createElement(Actual, null));
      }).toThrowError();
    });
  });

  describe('rendering', function () {
    it('should not pass down internal props', function () {
      var actualCompProps = {};
      var Bob = function Bob(props) {
        actualCompProps = props;
        return _react2.default.createElement(
          'div',
          null,
          'bob'
        );
      };

      var actualWorkProps = {};
      var BobWithJob = (0, _.withJob)(function (props) {
        actualWorkProps = props;
      })(Bob);

      var expected = {
        foo: 'foo',
        bar: 'bar',
        job: {}
      };
      (0, _enzyme.mount)(_react2.default.createElement(
        _ClientProvider2.default,
        null,
        _react2.default.createElement(BobWithJob, expected)
      ));

      var assertProps = function assertProps(actual) {
        var actualProps = Object.keys(actual);
        expect(actualProps.length).toEqual(3);
        expect(actualProps).toContain('foo');
        expect(actualProps).toContain('bar');
        expect(actualProps).toContain('job');
      };

      assertProps(actualCompProps);
      assertProps(actualWorkProps);
    });

    it('should provide the expected initial state for a defer', function () {
      var actual = {};
      var Bob = function Bob(props) {
        // eslint-disable-next-line
        actual = props.job;
        return _react2.default.createElement(
          'div',
          null,
          'bob'
        );
      };
      var BobWithJob = (0, _.withJob)(function () {
        return true;
      })(Bob, { defer: true });
      var expected = {
        inProgress: false,
        completed: true
      };
      (0, _enzyme.mount)(_react2.default.createElement(
        _ClientProvider2.default,
        null,
        _react2.default.createElement(BobWithJob, expected)
      ));
      expect(actual).toMatchObject(expected);
    });
  });
});