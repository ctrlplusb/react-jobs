/* @flow */

export type ReactJobsClientContext = {
  nextJobID: () => number,
  popJobRehydrationForSRR: (jobID: number) => any,
};

export type JobState = {
  inProgress: boolean,
  result?: any,
  error?: any,
}

export type RehydrateState = {
  jobsState: { [key: number] : JobState },
};

export type ReactJobsServerContext = {
  nextJobID: () => number,
  registerJobState: (number, JobState) => void,
  getJobState: number => any,
};

export type RenderContext = {
  registerJobState: (number, JobState) => void,
  getState: () => RehydrateState,
};

export type ClientProviderContext = {
  reactJobsClient: ReactJobsClientContext,
};

export type ServerProviderContext = {
  reactJobsServer: ReactJobsServerContext,
};

export type ProviderContext = ServerProviderContext & ClientProviderContext;
