/* @flow */

// eslint-disable-next-line import/no-extraneous-dependencies
import React, { Component } from 'react';
import { getDisplayName, isPromise } from './utils';
import type { JobState } from './ssr/types';

type Work = (props : Object) => any;

type State = JobState & { executingJob?: Promise<any> };

type Props = {
  jobInitState?: JobState,
  onJobProcessed?: (jobState: JobState) => void,
  [key: string]: any,
};

export default function withJob(work : Work) {
  if (typeof work !== 'function') {
    throw new Error('You must provide a "createWork" function to the "withJob".');
  }

  return function wrapComponentWithJob(WrappedComponent : Function) {
    class ComponentWithJob extends Component {
      props: Props;
      state: State;

      constructor(props : Props) {
        super(props);
        this.state = { inProgress: false };
      }

      componentWillMount() {
        const { jobInitState } = this.props;

        if (jobInitState) {
          this.setState(jobInitState);
          return;
        }

        this.handleWork(this.props);
      }

      componentWillReceiveProps(nextProps : Props) {
        this.handleWork(nextProps);
      }

      handleWork(props : Props) {
        const { onJobProcessed } = this.props;
        let workResult;

        try {
          workResult = work(props);
        } catch (error) {
          // Either a syncrhnous error or an error setting up the asynchronous
          // promise.
          this.setState({ error });
          return;
        }

        if (isPromise(workResult)) {
          workResult
            .then((result) => {
              this.setState({ inProgress: false, result });
              return result;
            })
            .catch((error) => {
              this.setState({ inProgress: false, error });
            })
            .then(() => {
              if (onJobProcessed) {
                onJobProcessed(this.getJobState());
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
    return ComponentWithJob;
  };
}
