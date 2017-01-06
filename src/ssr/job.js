/* @flow */
// @see https://github.com/facebook/react/issues/1137

import React, { PropTypes } from 'react';
import type { ProviderContext } from './types';
import { getDisplayName } from '../utils';
import clientOnlyJob from '../job';

const job = (work : any) => (Component : Function) => {
  // Oh I love you closures!
  let jobID = null;

  function withJobID(WrappedComponent) {
    const ComponentWithJobID = (props : Object, context : ProviderContext) => {
      if (!jobID) {
        jobID = context.reactJobsClient.nextJobID();
      }
      return <WrappedComponent {...props} jobID={jobID} />;
    };
    ComponentWithJobID.displayName = `${getDisplayName(WrappedComponent)}WithJobID`;
    ComponentWithJobID.contextTypes = {
      reactJobsClient: PropTypes.object.isRequired,
    };
    return ComponentWithJobID;
  }

  return withJobID(clientOnlyJob(work)(Component));
};

export default job;
