export default function createJobContext() {
  let idPointer = 0
  const jobs = {}
  return {
    getNextId: () => {
      idPointer += 1
      return idPointer
    },
    resetIds: () => {
      idPointer = 0
    },
    register: (jobID, result) => {
      jobs[jobID] = result
    },
    get: jobID => jobs[jobID],
    getState: () => ({ jobs }),
  }
}
