/* @flow */

export type ReactJobsClientContext = {
  nextJobID: () => number,
};

export type ClientProviderContext = {
  reactJobsClient: ReactJobsClientContext,
};
