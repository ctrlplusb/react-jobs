/* @flow */

import React, { Component, PropTypes } from 'react';
import { getDisplayName, isPromise } from './utils';
import type {
  ProviderContext,
  JobState,
} from './server/types';

type Work = (props : Object) => any;

type State = JobState & { executingJob?: Promise<any> };

type Props = {
  jobID?: number,
  [key: string]: any,
};

export default function job(work : Work) {
  if (typeof work !== 'function') {
    throw new Error('You must provide a function to a react-jobs job declaration.');
  }

  return function WrapComponentWithJob(WrappedComponent : Function) {
    class ComponentWithJob extends Component {
      props: Props;
      state: State;

      constructor(props : Props, context : ProviderContext) {
        super(props, context);
        this.state = { inProgress: false };
      }

      componentWillMount() {
        if (this.context.reactJobsClient) {
          const ssrRehydrateState = this.context
            .reactJobsClient
            .popJobRehydrationForSRR(this.props.jobID);
          if (ssrRehydrateState) {
            this.setState(ssrRehydrateState);
            return;
          }
        }

        if (this.context.reactJobsServer) {
          const jobState = this.context.reactJobsServer.getJobState(this.props.jobID);
          if (jobState) {
            this.setState(jobState);
            return;
          }
        }

        const context : ProviderContext = this.context;
        const workResult = work(this.props);

        if (isPromise(workResult)) {
          workResult
            .then((result) => {
              this.setState({ inProgress: false, result });
              return result;
            })
            .catch((error) => {
              console.warn('Job failed:\n', error); // eslint-disable-line no-console
              this.setState({ inProgress: false, error });
              return 'ouchy';
            })
            .then(() => {
              if (this.props.jobID && context.reactJobsServer) {
                context.reactJobsServer.registerJobState(
                  this.props.jobID,
                  this.getJobState(),
                );
              }
            });

          // Asynchronous result.
          this.setState({ inProgress: true, executingJob: workResult });
        } else {
          // Synchronous result.
          this.setState({ result: workResult });
        }
      }

      getExecutingJob() {
        if (!this.state.executingJob) {
          return undefined;
        }
        return this.state.executingJob;
      }

      getJobState() : JobState {
        const { inProgress, result, error } = this.state;
        return { inProgress, result, error };
      }

      render() {
        const jobState = this.getJobState();
        return <WrappedComponent {...this.props} job={jobState} />;
      }
    }
    ComponentWithJob.displayName = `${getDisplayName(WrappedComponent)}WithJob`;
    ComponentWithJob.contextTypes = {
      reactJobsClient: PropTypes.object,
      reactJobsServer: PropTypes.object,
    };
    return ComponentWithJob;
  };
}
