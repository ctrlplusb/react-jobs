/* @flow */

import React, { Component, PropTypes } from 'react';
import { getDisplayName, isPromise } from './utils';
import type { ServerProviderContext } from './server/types';
import type { ClientProviderContext } from './types';

type Work = (props : Object) => any;

type State = {
  resolved?: boolean,
  inProgress: boolean,
  result?: any,
  error?: any,
  executingWork? : Promise<any>,
};

type Props = Object;

type ProviderContext = ServerProviderContext | ClientProviderContext;

export default function job(work : Work) {
  if (typeof work !== 'function') {
    throw new Error('You must provide a function to a react-jobs job declaration.');
  }

  // Oh I love you closures!
  let jobID = null;

  function withJobID(WrappedComponent) {
    const ComponentWithJobID = (props : Object, context : ProviderContext) => {
      if (!jobID) {
        jobID = context.reactJobs.nextJobID();
      }
      return <WrappedComponent {...props} jobID={jobID} />;
    };
    ComponentWithJobID.displayName = `${getDisplayName(WrappedComponent)}WithJobID`;
    ComponentWithJobID.contextTypes = { reactJobs: PropTypes.object };
    return ComponentWithJobID;
  }

  return function WrapComponentWithJob(WrappedComponent : Function) {
    class ComponentWithJob extends Component {
      props: Props;
      state: State;

      constructor(props : Props, context : ProviderContext) {
        super(props, context);
        if (context.reactJobsClient) {
          if (context.reactJobsClient.isJobResolved(this.props.jobID)) {
            // We are rehydrating on the client, therefore we will ignore this
            // render parse.
            return;
          }
        }
        if (context.reactJobsServer) {
          const jobResults = context.reactJobsServer.getJobResults(this.props.jobID);
          if (jobResults) {
            this.state = Object.assign(
              {},
              jobResults,
              { resolved: true },
            );
          }
        }
        if (!this.state) {
          this.state = { inProgress: false };
        }
      }

      componentWillMount() {
        if (this.state.resolved) {
          return;
        }

        const context : ProviderContext = this.context;
        const x = work(this.props);

        if (isPromise(x)) {
          const executingWork = x
            .then((result) => { this.setState({ inProgress: false, result }); return result; })
            .catch((error) => {
              console.warn('Job failed:\n', error); // eslint-disable-line no-console
              this.setState({ inProgress: false, error });
            })
            .then(() => {
              if (context.reactJobsServer) {
                context.reactJobsServer.registerJobResults(this.props.jobID, this.state);
              }
            });

          // Asynchronous result.
          this.setState({ inProgress: true, executingWork });
        } else {
          // Synchronous result.
          this.setState({ result: x });
        }
      }

      getExecutingJob() {
        if (!this.state.executingWork) {
          return undefined;
        }
        return this.state.executingWork;
      }

      render() {
        const { inProgress, result, error } = this.state;
        const jobProp = { inProgress, result, error };
        return <WrappedComponent {...this.props} job={jobProp} />;
      }
    }
    ComponentWithJob.displayName = `${getDisplayName(WrappedComponent)}WithJob`;
    ComponentWithJob.contextTypes = { reactJobs: PropTypes.object };
    return withJobID(ComponentWithJob);
  };
}
