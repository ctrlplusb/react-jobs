/*  */

export default function createRenderContext() {
  const jobsState = {}
  return {
    registerJobState: (jobID, state) => {
      jobsState[jobID] = state
    },
    getState() {
      return {
        jobsState,
      }
    },
  }
}
