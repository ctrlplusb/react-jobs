'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _server = require('react-dom/server');

var _helpers = require('../../../tools/tests/helpers');

var _ = require('../');

var _constants = require('../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var workTime = 10;

var createComponents = function createComponents() {
  return {
    Hello: (0, _.withJob)(function () {
      return (0, _helpers.resolveAfter)(workTime, 'Hello world!');
    })(_helpers.Foo),
    Goodbye: (0, _.withJob)(function () {
      return (0, _helpers.resolveAfter)(workTime, 'Goodbye world!');
    })(_helpers.Foo),
    Fail: (0, _.withJob)(function () {
      return (0, _helpers.rejectAfter)(workTime, 'Oh noes!');
    })(_helpers.Foo)
  };
};

var createApp = function createApp() {
  var _createComponents = createComponents(),
      Hello = _createComponents.Hello,
      Goodbye = _createComponents.Goodbye,
      Fail = _createComponents.Fail;

  return _react2.default.createElement(
    'div',
    null,
    _react2.default.createElement(Hello, null),
    _react2.default.createElement(Goodbye, null),
    _react2.default.createElement(Fail, null)
  );
};

describe('integration', function () {
  afterEach(function () {
    delete global.window[_constants.STATE_IDENTIFIER];
  });

  it('full ssr app works', function () {
    var serverApp = createApp();
    return (0, _.runJobs)(serverApp).then(function (_ref) {
      var appWithJobs = _ref.appWithJobs,
          state = _ref.state,
          STATE_ID = _ref.STATE_IDENTIFIER;

      // "Server" render
      var serverRender = (0, _server.renderToString)(appWithJobs);
      expect(serverRender).toMatchSnapshot();
      // Attach the state to the "window" for the client
      global.window[STATE_ID] = state;
      return serverRender;
    }).then(function (serverRender) {
      // "Client" render
      var clientApp = createApp();
      return (0, _.rehydrateJobs)(clientApp).then(function (_ref2) {
        var appWithJobs = _ref2.appWithJobs;

        var clientRender = (0, _server.renderToString)(appWithJobs);
        expect(clientRender).toEqual(serverRender);
        return appWithJobs;
      });
    }).then(function (clientApp) {
      // Second "Client" render
      // The second "Client" render should be async as we only use the
      // server hydration state once.
      var clientSecondRender = (0, _server.renderToString)(clientApp);
      expect(clientSecondRender).toMatchSnapshot();
    });
  });
});