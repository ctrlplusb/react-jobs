/* @flow */

import type { RunJobsExecutionContext, JobState } from './types';

export default function createRenderContext() : RunJobsExecutionContext {
  const jobsState = {};
  return {
    registerJobState: (jobID, state : JobState) => {
      jobsState[jobID] = state;
    },
    getState() {
      return {
        jobsState,
      };
    },
  };
}
