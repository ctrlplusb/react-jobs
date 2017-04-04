import React from 'react'
import ClientProvider from './ClientProvider'
import { STATE_IDENTIFIER } from './constants'

export default function rehydrateJobs(app) {
  return new Promise((resolve) => {
    const appWithJobs = (
      <ClientProvider ssrState={window[STATE_IDENTIFIER]}>
        {app}
      </ClientProvider>
    )
    resolve({ appWithJobs })
  })
}
