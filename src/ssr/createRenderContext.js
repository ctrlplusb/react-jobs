/* @flow */

import type { RenderContext, JobState } from './types';

export default function createRenderContext() : RenderContext {
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
