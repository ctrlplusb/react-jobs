/* @flow */

import React from 'react';
import { renderToString } from 'react-dom/server';
import { Foo, resolveAfter, rejectAfter } from './__helpers__';
import {
  ClientProvider,
  ServerProvider,
  job,
  runJobs,
  createRenderContext,
} from '../src/ssr';
import type {
  RehydrateState,
  RenderContext,
} from '../src/ssr/types';

const workTime = 10;

const createComponents = () => ({
  Hello: job(() => resolveAfter(workTime, 'Hello world!'))(Foo),
  Goodbye: job(() => resolveAfter(workTime, 'Goodbye world!'))(Foo),
  Fail: job(() => rejectAfter(workTime, 'Oh noes!'))(Foo),
});

const createApp = () => {
  const { Hello, Goodbye, Fail } = createComponents();
  return () => (
    <div>
      <Hello />
      <Goodbye />
      <Fail />
    </div>
  );
};

const createServerApp = (renderContext : RenderContext) => {
  const App = createApp();
  return (
    <ServerProvider renderContext={renderContext}>
      <App />
    </ServerProvider>
  );
};

const createClientApp = (ssrState : RehydrateState) => {
  const App = createApp();
  return (
    <ClientProvider ssrState={ssrState}>
      <App />
    </ClientProvider>
  );
};

describe('integration', () => {
  it('works', () => {
    const serverRenderContext = createRenderContext();
    const serverApp = createServerApp(serverRenderContext);
    return runJobs(serverApp)
      .then(
        () => undefined,
        // We don't want errors to bail out the test.
        () => undefined,
      )
      .then(() => {
        // "Server" render
        const serverRender = renderToString(serverApp);
        expect(serverRender).toMatchSnapshot();
        const state = serverRenderContext.getState();

        // "Client" render
        const clientApp = createClientApp(state);
        const clientRender = renderToString(clientApp);
        expect(clientRender).toEqual(serverRender);

        // The second "Client" render should be async as we only use the
        // server hydration state once.
        const clientSecondRender = renderToString(clientApp);
        expect(clientSecondRender).toMatchSnapshot();
      });
  });
});
