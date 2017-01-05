/* @flow */

import React, { PropTypes } from 'react';
import createRenderContext from './createRenderContext';
import runJobs from './runJobs';
import ClientProvider from './ClientProvider';
import ServerProvider from './ServerProvider';
import clientOnlyJob from '../job';
import type { ProviderContext } from './types';
import { getDisplayName } from '../utils';

const job = (work : any) => (Component : Function) => {
  // Oh I love you closures!
  let jobID = null;

  function withJobID(WrappedComponent) {
    const ComponentWithJobID = (props : Object, context : ProviderContext) => {
      if (!jobID) {
        if (context.reactJobsClient) {
          jobID = context.reactJobsClient.nextJobID();
        } else if (context.reactJobsServer) {
          jobID = context.reactJobsServer.nextJobID();
        }
      }
      return <WrappedComponent {...props} jobID={jobID} />;
    };
    ComponentWithJobID.displayName = `${getDisplayName(WrappedComponent)}WithJobID`;
    ComponentWithJobID.contextTypes = {
      reactJobsClient: PropTypes.object,
      reactJobsServer: PropTypes.object,
    };
    return ComponentWithJobID;
  }

  return withJobID(clientOnlyJob(work)(Component));
};

export {
  createRenderContext,
  runJobs,
  ClientProvider,
  ServerProvider,
  job,
};
