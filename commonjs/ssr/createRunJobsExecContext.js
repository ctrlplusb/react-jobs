"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createRenderContext;
function createRenderContext() {
  var jobsState = {};
  return {
    registerJobState: function registerJobState(jobID, state) {
      jobsState[jobID] = state;
    },
    getState: function getState() {
      return {
        jobsState: jobsState
      };
    }
  };
}