/* @flow */

import React from 'react';
import { renderToString } from 'react-dom/server';
import { Foo, resolveAfter, rejectAfter } from '../../helpers';
import {
  job,
  runJobs,
  rehydrateJobs,
} from '../../../src/ssr';
import { STATE_IDENTIFIER } from '../../../src/ssr/constants';

const workTime = 10;

const createComponents = () => ({
  Hello: job(() => resolveAfter(workTime, 'Hello world!'))(Foo),
  Goodbye: job(() => resolveAfter(workTime, 'Goodbye world!'))(Foo),
  Fail: job(() => rejectAfter(workTime, 'Oh noes!'))(Foo),
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
      .then(({ app, state, STATE_IDENTIFIER: STATE_ID }) => {
        // "Server" render
        const serverRender = renderToString(app);
        expect(serverRender).toMatchSnapshot();
        // Attach the state to the "window" for the client
        global.window[STATE_ID] = state;
        return serverRender;
      })
      .then((serverRender) => {
        // "Client" render
        const clientApp = createApp();
        return rehydrateJobs(clientApp)
          .then(({ app }) => {
            const clientRender = renderToString(app);
            expect(clientRender).toEqual(serverRender);
            return app;
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