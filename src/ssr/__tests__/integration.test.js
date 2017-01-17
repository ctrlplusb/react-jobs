/* @flow */

import React from 'react';
import { renderToString } from 'react-dom/server';
import { Foo, resolveAfter, rejectAfter } from '../../../tools/tests/helpers';
import {
  withJob,
  runJobs,
  rehydrateJobs,
} from '../';
import { STATE_IDENTIFIER } from '../constants';

const workTime = 10;

const createComponents = () => ({
  Hello: withJob(() => resolveAfter(workTime, 'Hello world!'))(Foo),
  Goodbye: withJob(() => resolveAfter(workTime, 'Goodbye world!'))(Foo),
  Fail: withJob(() => rejectAfter(workTime, 'Oh noes!'))(Foo),
});

const createApp = () => {
  const { Hello, Goodbye, Fail } = createComponents();
  return (
    <div>
      <Hello />
      <Goodbye />
      <Fail />
    </div>
  );
};

describe('integration', () => {
  afterEach(() => {
    delete global.window[STATE_IDENTIFIER];
  });

  it('full ssr app works', () => {
    const serverApp = createApp();
    return runJobs(serverApp)
      .then(({ appWithJobs, state, STATE_IDENTIFIER: STATE_ID }) => {
        // "Server" render
        const serverRender = renderToString(appWithJobs);
        expect(serverRender).toMatchSnapshot();
        // Attach the state to the "window" for the client
        global.window[STATE_ID] = state;
        return serverRender;
      })
      .then((serverRender) => {
        // "Client" render
        const clientApp = createApp();
        return rehydrateJobs(clientApp)
          .then(({ appWithJobs }) => {
            const clientRender = renderToString(appWithJobs);
            expect(clientRender).toEqual(serverRender);
            return appWithJobs;
          });
      })
      .then((clientApp) => {
        // Second "Client" render
        // The second "Client" render should be async as we only use the
        // server hydration state once.
        const clientSecondRender = renderToString(clientApp);
        expect(clientSecondRender).toMatchSnapshot();
      });
  });
});
