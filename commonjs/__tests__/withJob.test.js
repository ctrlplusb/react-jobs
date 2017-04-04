'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _enzyme = require('enzyme');

var _helpers = require('../../tools/tests/helpers');

var _withJob = require('../withJob');

var _withJob2 = _interopRequireDefault(_withJob);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var workTime = 10; // ms

describe('withJob()', function () {
  (0, _helpers.warningsToErrors)();

  describe('arguments', function () {
    it('returns a function', function () {
      var actual = _typeof((0, _withJob2.default)(function () {
        return undefined;
      }));
      var expected = 'function';
      expect(actual).toEqual(expected);
    });

    it('should throws if no work is provided', function () {
      // $FlowIgnore: we expect this to flow error
      expect(function () {
        return (0, _withJob2.default)();
      }).toThrowError('You must provide a "work" function to the "withJob".');
    });

    it('should throws if the work is invalid', function () {
      // $FlowIgnore: we expect this to flow error
      expect(function () {
        return (0, _withJob2.default)(1);
      }).toThrowError('You must provide a "work" function to the "withJob".');
    });
  });

  describe('higher order component', function () {
    var hoc = (0, _withJob2.default)(function () {
      return (0, _helpers.resolveAfter)(1);
    });
    var Actual = hoc(_helpers.Foo);

    it('should return a renderable component', function () {
      expect(function () {
        return (0, _enzyme.mount)(_react2.default.createElement(Actual, null));
      }).not.toThrowError();
    });
  });

  describe('rendering', function () {
    it('should set the "result" immediately if the work does not return a promise', function () {
      var FooWithJob = (0, _withJob2.default)(function () {
        return 'bob';
      })(_helpers.Foo);
      expect((0, _enzyme.mount)(_react2.default.createElement(FooWithJob, null))).toMatchSnapshot();
    });

    it('should provide the props to the work function', function () {
      var expected = { foo: 'bar', baz: 'qux' };
      var actual = void 0;
      var FooWithJob = (0, _withJob2.default)(function (props) {
        actual = props;
      })(_helpers.Foo);
      (0, _enzyme.mount)(_react2.default.createElement(FooWithJob, expected));
      expect(actual).toMatchObject(expected);
    });

    it('should set "inProgress" when processing work', function () {
      var FooWithJob = (0, _withJob2.default)(function () {
        return (0, _helpers.resolveAfter)(workTime);
      })(_helpers.Foo);
      var actual = (0, _enzyme.mount)(_react2.default.createElement(FooWithJob, null)).find(_helpers.Foo).props();
      var expected = { job: { completed: false, inProgress: true } };
      expect(actual).toMatchObject(expected);
    });

    it('should set "result" when work completes successfully', function () {
      var FooWithJob = (0, _withJob2.default)(function () {
        return (0, _helpers.resolveAfter)(workTime, 'result');
      })(_helpers.Foo);
      var renderWrapper = (0, _enzyme.mount)(_react2.default.createElement(FooWithJob, null));
      // Allow enough time for work to complete
      return (0, _helpers.resolveAfter)(workTime + 5).then(function () {
        var actual = renderWrapper.find(_helpers.Foo).props();
        var expected = { job: { completed: true, inProgress: false, result: 'result' } };
        expect(actual).toMatchObject(expected);
      })
      // swallow other errors
      .catch(function () {
        return undefined;
      });
    });

    it('should set "error" when asynchronous work fails', function () {
      var error = new Error('poop');
      var FooWithJob = (0, _withJob2.default)(function () {
        return (0, _helpers.rejectAfter)(workTime, error);
      })(_helpers.Foo);
      var renderWrapper = (0, _enzyme.mount)(_react2.default.createElement(FooWithJob, null));
      // Allow enough time for work to complete
      return (0, _helpers.resolveAfter)(workTime + 5).then(function () {
        var actual = renderWrapper.find(_helpers.Foo).props();
        var expected = { job: { completed: true, inProgress: false, error: error } };
        expect(actual).toMatchObject(expected);
      })
      // swallow other errors
      .catch(function () {
        return undefined;
      });
    });

    it('should set "error" when synchronous work fails', function () {
      var error = new Error('poop');
      var FooWithJob = (0, _withJob2.default)(function () {
        throw error;
      })(_helpers.Foo);
      var renderWrapper = (0, _enzyme.mount)(_react2.default.createElement(FooWithJob, null));
      var actual = renderWrapper.find(_helpers.Foo).props();
      var expected = { job: { completed: true, inProgress: false, error: error } };
      expect(actual).toMatchObject(expected);
    });

    it('should not fire again when no "config.shouldWorkAgain" is provided', function () {
      var fireCount = 0;
      var Component = (0, _withJob2.default)(function () {
        fireCount += 1;
        return 'foo';
      })(function () {
        return _react2.default.createElement(
          'div',
          null,
          'bob'
        );
      });
      var renderWrapper = (0, _enzyme.mount)(_react2.default.createElement(Component, { foo: 'foo' }));
      expect(fireCount).toEqual(1);
      // Set props to cause a re-render
      renderWrapper.setProps({ foo: 'bar' });
      expect(fireCount).toEqual(1);
    });

    it('should fire again for a remount', function () {
      var fireCount = 0;
      var Component = (0, _withJob2.default)(function () {
        fireCount += 1;
        return true;
      })(function () {
        return _react2.default.createElement(
          'div',
          null,
          'bob'
        );
      });
      (0, _enzyme.mount)(_react2.default.createElement(Component, null));
      expect(fireCount).toEqual(1);
      (0, _enzyme.mount)(_react2.default.createElement(Component, null));
      expect(fireCount).toEqual(2);
    });

    it('should fire expectantly for a "shouldWorkAgain" implementation', function () {
      var prevProductIds = [];
      var fireCount = 0;
      var Component = (0, _withJob2.default)(function (_ref) {
        var productId = _ref.productId;

        prevProductIds.push(productId);
        fireCount += 1;
        return true;
      }, {
        shouldWorkAgain: function shouldWorkAgain(prevProps, nextProps, currentJob) {
          return (currentJob.inProgress || currentJob.completed) && prevProductIds.indexOf(nextProps.productId) === -1;
        }
      })(function () {
        return _react2.default.createElement(
          'div',
          null,
          'bob'
        );
      });
      var renderWrapper = (0, _enzyme.mount)(_react2.default.createElement(Component, { productId: 1 }));
      expect(fireCount).toEqual(1);
      renderWrapper.setProps({ productId: 2 });
      expect(fireCount).toEqual(2);
      renderWrapper.setProps({ productId: 3 });
      expect(fireCount).toEqual(3);
      renderWrapper.setProps({ productId: 2 });
      expect(fireCount).toEqual(3);
      renderWrapper.setProps({ productId: 1 });
      expect(fireCount).toEqual(3);
    });
  });
});