"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createJobContext;
function createJobContext() {
  var idPointer = 0;
  var jobs = {};
  return {
    getNextId: function getNextId() {
      idPointer += 1;
      return idPointer;
    },
    register: function register(jobID, result) {
      jobs[jobID] = result;
    },
    get: function get(jobID) {
      return jobs[jobID];
    },
    getState: function getState() {
      return { jobs: jobs };
    }
  };
}