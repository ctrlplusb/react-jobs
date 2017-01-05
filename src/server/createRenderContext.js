/* @flow */

import type { RenderContext } from '../sharedTypes';

export default function createRenderContext() : RenderContext {
  let currentjobID = 0;
  const resolvedJobs = {};
  return {
    setCurrentJobID: (jobID) => {
      currentjobID = jobID;
    },
    registerResolvedJob: (jobID) => {
      resolvedJobs[jobID] = true;
    },
    getState() {
      return {
        currentjobID,
        resolvedJobs,
      };
    },
  };
}
