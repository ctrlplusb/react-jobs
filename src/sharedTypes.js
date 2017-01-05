/* @flow */

export type ProviderContext = {
  reactJobs: {
    nextJobID: () => number,
    registerJobResults: (jobID: number, results: any) => void,
    getJobResults: (jobID: number) => any,
  },
};
