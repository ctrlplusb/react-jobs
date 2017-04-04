'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _enzyme = require('enzyme');

var _ = require('../');

var _helpers = require('../../../tools/tests/helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var workTime = 10; // ms

describe('runJobs()', function () {
  it('should return a Promise', function () {
    var actual = (0, _.runJobs)(_react2.default.createElement(
      'div',
      null,
      'foo'
    ));
    expect(actual.then).toBeTruthy();
  });

  it('should render a job that succeeds', function () {
    var FooWithJob = (0, _.withJob)(function () {
      return (0, _helpers.resolveAfter)(workTime, 'Hello world!');
    })(_helpers.Foo);
    var app = _react2.default.createElement(FooWithJob, null);
    return (0, _.runJobs)(app).then(function (_ref) {
      var appWithJobs = _ref.appWithJobs;

      expect((0, _enzyme.mount)(appWithJobs)).toMatchSnapshot();
    });
  });

  it('should render a job that fails', function () {
    var FooWithJob = (0, _.withJob)(function () {
      return (0, _helpers.rejectAfter)(workTime, 'Poop!');
    })(_helpers.Foo);
    var app = _react2.default.createElement(FooWithJob, null);
    return (0, _.runJobs)(app).then(function (_ref2) {
      var appWithJobs = _ref2.appWithJobs;

      expect((0, _enzyme.mount)(appWithJobs)).toMatchSnapshot();
    });
  });

  it('should not render a job that is deferred', function () {
    var FooWithJob = (0, _.withJob)(function () {
      return (0, _helpers.resolveAfter)(workTime, 'Hello world!');
    }, { defer: true })(_helpers.Foo);
    var app = _react2.default.createElement(FooWithJob, null);
    return (0, _.runJobs)(app).then(function (_ref3) {
      var appWithJobs = _ref3.appWithJobs;

      expect((0, _enzyme.mount)(appWithJobs)).toMatchSnapshot();
    });
  });
});