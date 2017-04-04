'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _enzyme = require('enzyme');

var _ssr = require('../../ssr');

var _workAgainForMonitoredProps = require('../workAgainForMonitoredProps');

var _workAgainForMonitoredProps2 = _interopRequireDefault(_workAgainForMonitoredProps);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var contextStub = {
  reactJobsClient: {
    nextJobID: function nextJobID() {
      return 1;
    },
    popJobRehydrationForSRR: function popJobRehydrationForSRR() {
      return undefined;
    }
  }
};

var fireCount = 0;

var createComponent = function createComponent(config) {
  return (0, _ssr.withJob)(function () {
    fireCount += 1;
    return true;
  }, { shouldWorkAgain: (0, _workAgainForMonitoredProps2.default)(config) })(function () {
    return _react2.default.createElement(
      'div',
      null,
      'bob'
    );
  });
};

beforeEach(function () {
  fireCount = 0;
});

describe('workAgainForMonitoredProps', function () {
  it('should fire when a monitor prop changes', function () {
    var Bob = createComponent(['productId']);
    var renderWrapper = (0, _enzyme.mount)(_react2.default.createElement(Bob, { productId: 1 }), { context: contextStub });
    expect(fireCount).toEqual(1);
    renderWrapper.setProps({ productId: 2 });
    expect(fireCount).toEqual(2);
    renderWrapper.setProps({ productId: 3 });
    expect(fireCount).toEqual(3);
    renderWrapper.setProps({ productId: 2 });
    expect(fireCount).toEqual(4);
    renderWrapper.setProps({ productId: 2 });
    expect(fireCount).toEqual(4);
  });

  it('should fire when any of multiple monitor props change', function () {
    var Bob = createComponent(['searchTerm', 'searchLimit']);
    var renderWrapper = (0, _enzyme.mount)(_react2.default.createElement(Bob, { searchTerm: 'foo', searchLimit: 10 }), { context: contextStub });
    expect(fireCount).toEqual(1);
    renderWrapper.setProps({ searchTerm: 'foo', searchLimit: 10 });
    expect(fireCount).toEqual(1);
    renderWrapper.setProps({ searchTerm: 'bar', searchLimit: 10 });
    expect(fireCount).toEqual(2);
    renderWrapper.setProps({ searchTerm: 'bar', searchLimit: 20 });
    expect(fireCount).toEqual(3);
    renderWrapper.setProps({ searchTerm: 'bar', searchLimit: 20 });
    expect(fireCount).toEqual(3);
  });

  it('should fire when a dot-notation object monitor prop changes', function () {
    var Bob = createComponent(['params.productId']);
    var renderWrapper = (0, _enzyme.mount)(_react2.default.createElement(Bob, { params: { productId: 1 } }), { context: contextStub });
    expect(fireCount).toEqual(1);
    renderWrapper.setProps({ params: { productId: 2 } });
    expect(fireCount).toEqual(2);
    renderWrapper.setProps({ params: { productId: 3 } });
    expect(fireCount).toEqual(3);
    renderWrapper.setProps({ params: { productId: 2 } });
    expect(fireCount).toEqual(4);
    renderWrapper.setProps({ params: { productId: 2 } });
    expect(fireCount).toEqual(4);
  });
});