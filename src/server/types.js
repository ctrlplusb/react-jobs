/* @flow */

import type { RehydrateState, JobState } from '../types';

export type ReactJobsContext = {
  nextJobID: () => number,
  registerJobState: (number, JobState) => void,
  getJobState: number => any,
};

export type ServerProviderContext = {
  reactJobsServer: ReactJobsContext,
};

export type RenderContext = {
  registerJobState: (number, JobState) => void,
  getState: () => RehydrateState,
};
