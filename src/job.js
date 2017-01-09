/* @flow */

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

export default function job(work : Work) {
  if (typeof work !== 'function') {
    throw new Error('You must provide a function to a react-jobs job declaration.');
  }

  return function WrapComponentWithJob(WrappedComponent : Function) {
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
        const workResult = work(props);

        if (isPromise(workResult)) {
          workResult
            .then((result) => {
              this.setState({ inProgress: false, result });
              return result;
            })
            .catch((error) => {
              console.warn('Job failed:\n', error); // eslint-disable-line no-console
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
