/* @flow */

import { Element } from 'react';

export type React$Element = Element<*>;

export type JobState = {
  inProgress: boolean,
  result?: any,
  error?: any,
}

export type JobsState = { [key: number] : JobState };

export type RehydrateState = {
  jobsState: JobsState,
};

export type RunJobsExecutionContext = {
  registerJobState: (number, JobState) => void,
  getState: () => RehydrateState,
};

export type ReactJobsServerContext = {
  registerJobState: (number, JobState) => void,
  getJobState: number => any,
};

export type ServerProviderChildContext = {
  reactJobsServer: ReactJobsServerContext,
};

export type ReactJobsClientContext = {
  nextJobID: () => number,
  popJobRehydrationForSRR: number => any,
};

export type ClientProviderChildContext = {
  reactJobsClient: ReactJobsClientContext,
};

export type JobContext = {
  reactJobsClient?: ReactJobsClientContext,
  reactJobsServer?: ReactJobsServerContext,
};
