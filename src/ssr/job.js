/* @flow */
// @see https://github.com/facebook/react/issues/1137

import React, { PropTypes } from 'react';
import type { JobContext } from './types';
import { getDisplayName } from '../utils';
import clientOnlyJob from '../job';

const getInitialState = (context, jobID) => {
  const { reactJobsClient, reactJobsServer } = context;

  if (reactJobsServer) {
    const jobState = reactJobsServer.getJobState(jobID);
    if (jobState) {
      return jobState;
    }
  }
  if (reactJobsClient) {
    const ssrRehydrateState = reactJobsClient.popJobRehydrationForSRR(jobID);
    if (ssrRehydrateState) {
      return ssrRehydrateState;
    }
  }

  return undefined;
};

const job = (work : any) => (Component : Function) => {
  let jobIDHandle = null;

  function withSSRBehaviour(WrappedComponent) {
    const ComponentWithJobID = (props : Object, context : JobContext) => {
      const { reactJobsClient, reactJobsServer } = context;

      if (!reactJobsClient) {
        throw new Error('TODO: ERROR MESSAGE');
      }

      const getJobID = () => {
        if (!jobIDHandle) {
          jobIDHandle = reactJobsClient.nextJobID();
        }
        return jobIDHandle;
      };

      const jobID = getJobID();

      const initialState = getInitialState(context, jobID);

      const onJobProcessed = reactJobsServer
        ? jobsState => reactJobsServer.registerJobState(jobID, jobsState)
        : null;

      return (
        <WrappedComponent
          {...props}
          jobInitState={initialState}
          onJobProcessed={onJobProcessed}
        />
      );
    };
    ComponentWithJobID.displayName = `${getDisplayName(WrappedComponent)}WithJobID`;
    ComponentWithJobID.contextTypes = {
      reactJobsClient: PropTypes.object.isRequired,
      reactJobsServer: PropTypes.object,
    };
    return ComponentWithJobID;
  }

  return withSSRBehaviour(clientOnlyJob(work)(Component));
};

export default job;
