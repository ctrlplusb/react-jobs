/* @flow */

// eslint-disable-next-line import/no-extraneous-dependencies
import React, { Component, PropTypes } from 'react';
import ClientProvider from './ClientProvider';
import type {
  ServerProviderChildContext,
  JobsState,
  JobState,
  React$Element,
  RunJobsExecutionContext,
} from './types';

type Props = {
  children? : React$Element,
  runJobsExecContext? : RunJobsExecutionContext,
};

class ServerProvider extends Component {
  props : Props;
  jobStates : JobsState;

  constructor(props : Props) {
    super(props);
    if (props.runJobsExecContext) {
      this.jobStates = props.runJobsExecContext.getState().jobsState;
    } else {
      this.jobStates = {};
    }
  }

  getChildContext() {
    const context : ServerProviderChildContext = {
      reactJobsServer: {
        registerJobState: (jobID : number, jobState : JobState) => {
          this.jobStates[jobID] = jobState;
          if (this.context.runJobsExecContext) {
            this.context.runJobsExecContext.registerJobState(jobID, jobState);
          }
        },
        getJobState: (jobID : number) => this.jobStates[jobID],
      },
    };

    return context;
  }

  render() {
    return (
      <ClientProvider>
        {this.props.children}
      </ClientProvider>
    );
  }
}

ServerProvider.contextTypes = {
  reactJobsRunner: PropTypes.object,
};
ServerProvider.childContextTypes = {
  reactJobsServer: PropTypes.object.isRequired,
};

export default ServerProvider;
