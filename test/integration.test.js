/* @flow */

import React from 'react';
import { renderToString } from 'react-dom/server';
import { Foo, resolveAfter } from './__helpers__';
import ClientProvider from '../src/ClientProvider';
import ServerProvider from '../src/server/ServerProvider';
import job from '../src/job';
import runJobs from '../src/server/runJobs';
import createRenderContext from '../src/server/createRenderContext';
import type { RenderContext } from '../src/server/types';

const workTime = 10;

const createServerApp = (renderContext : RenderContext) => {
  const FooWithJob = job(() => resolveAfter(workTime, 'Hello world!'))(Foo);
  return (
    <ServerProvider renderContext={renderContext}>
      <FooWithJob />
    </ServerProvider>
  );
};

const createClientApp = (state : Object) => {
  const FooWithJob = job(() => resolveAfter(workTime, 'Hello world!'))(Foo);
  return (
    <ClientProvider state={state}>
      <FooWithJob />
    </ClientProvider>
  );
};

describe('integration', () => {
  it.only('works', () => {
    const serverRenderContext = createRenderContext();
    const serverApp = createServerApp(serverRenderContext);

    return runJobs(serverApp)
      .then(() => {
        // "Server" render
        const serverRender = renderToString(serverApp);
        expect(serverRender).toMatchSnapshot();
        const state = serverRenderContext.getState();

        // "Client" render
        const clientApp = createClientApp(state);
        const clientRender = renderToString(clientApp);
        expect(clientRender).toEqual(serverRender);
      });
  });
});
