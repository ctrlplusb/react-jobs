/* @flow */

export type ReactJobsContext = {
  nextJobID: () => number,
  registerJobResults: (jobID: number, results: any) => void,
  getJobResults: (jobID: number) => any,
};

export type ServerProviderContext = {
  reactJobsServer: ReactJobsContext,
};

export type RenderContext = {
  setCurrentJobID: number => void,
  registerResolvedJob: number => void,
  getState: () => Object,
};
