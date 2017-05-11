/* eslint-disable react/prop-types */

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import asyncBootstrapper from 'react-async-bootstrapper'
import { mount } from 'enzyme'
import { resolveAfter, rejectAfter } from '../../tools/tests/helpers'
import { withJob, createJobContext, JobProvider } from '../'

const workTime = 10

function ResultRenderer({ jobResult, children }) {
  return (
    <div>
      {jobResult}
      {children &&
        <div>
          {children}
        </div>}
    </div>
  )
}
const ErrorComponent = ({ error }) => <div>{error ? error.message : null}</div>

const createComponents = () => ({
  Hello: withJob({ work: () => resolveAfter(workTime, 'Hello') })(
    ResultRenderer,
  ),
  World: withJob({ work: () => resolveAfter(workTime, 'World') })(
    ResultRenderer,
  ),
  Goodbye: withJob({ work: () => resolveAfter(workTime, 'Goodbye') })(
    ResultRenderer,
  ),
  Fail: withJob({
    work: () => rejectAfter(workTime, new Error('Oh noes!')),
    ErrorComponent,
  })(ResultRenderer),
})

const createApp = (context, state) => {
  const { Hello, World, Goodbye, Fail } = createComponents()
  return (
    <JobProvider jobContext={context} rehydrateState={state}>
      <div>
        <Hello>
          <World />
        </Hello>
        <Goodbye />
        <Fail />
      </div>
    </JobProvider>
  )
}

describe('integration tests', () => {
  it('render server and client', () => {
    // we have to delete the window to emulate a server only environment
    const windowTemp = global.window
    delete global.window

    // Server side render
    const jobContext = createJobContext()
    const serverApp = createApp(jobContext)
    return (
      asyncBootstrapper(serverApp)
        .then(() => {
          const serverString = renderToStaticMarkup(serverApp)
          // SNAPSHOT 1
          expect(serverString).toMatchSnapshot()
          const stateForClient = jobContext.getState()
          // SNAPSHOT 2
          expect(stateForClient).toMatchSnapshot()
          // Restore the window and attach the state to the "window" for the
          // client
          global.window = windowTemp
          return { serverHTML: serverString, stateForClient }
        })
        .then(({ serverHTML, stateForClient }) => {
          // "Client" side render...

          const clonedState = {
            jobs: Object.assign({}, stateForClient.jobs),
          }

          const clientApp = createApp(undefined, stateForClient)
          const clientRenderWrapper = mount(clientApp)
          // SNAPSHOT 3
          expect(clientRenderWrapper).toMatchSnapshot()

          // Also validate that it matches server result. Need to return
          // a new result as data is removed after rehydration.
          expect(
            renderToStaticMarkup(createApp(undefined, clonedState)),
          ).toEqual(serverHTML)

          return clientRenderWrapper
        })
        // Now give the client side components time to resolve
        .then(
          clientRenderWrapper =>
            new Promise(resolve =>
              setTimeout(() => resolve(clientRenderWrapper), 100),
            ),
        )
        // Now a full render should have occured on client
        // SNAPSHOT 4
        .then(clientRenderWrapper =>
          expect(clientRenderWrapper).toMatchSnapshot(),
        )
    )
  })
})
