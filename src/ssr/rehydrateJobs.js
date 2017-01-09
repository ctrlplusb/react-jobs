/* @flow */

// eslint-disable-next-line import/no-extraneous-dependencies
import React, { Element } from 'react';
import ClientProvider from './ClientProvider';
import { STATE_IDENTIFIER } from './constants';

export default function rehydrateJobs(app : Element<any>) {
  return new Promise((resolve) => {
    const appWithJobs = (
      <ClientProvider ssrState={window[STATE_IDENTIFIER]}>
        {app}
      </ClientProvider>
    );
    resolve({ appWithJobs });
  });
}
