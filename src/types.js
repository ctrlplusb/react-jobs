/* @flow */

export type ReactJobsClientContext = {
  nextJobID: () => number,
  popJobRehydrationForSRR: (jobID: number) => any,
};

export type ClientProviderContext = {
  reactJobsClient: ReactJobsClientContext,
};

export type JobState = {
  inProgress: boolean,
  result?: any,
  error?: any,
}

export type RehydrateState = {
  jobsState: { [key: number] : JobState },
};
