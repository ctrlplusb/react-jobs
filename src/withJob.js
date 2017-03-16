/* @flow */

import React, { Component } from 'react';
import { getDisplayName, isPromise, propsWithoutInternal } from './utils';
import type { JobState } from './ssr/types';

type Work = (props : Object) => any;

type State = JobState & {
  executingJob?: Promise<any>,
  monitorState?: { [key : string] : mixed },
};

type Props = {
  jobInitState?: JobState,
  onJobProcessed?: (jobState: JobState) => void,
  [key: string]: any,
};

type Config = {
  shouldWorkAgain? : (Object, Object, Object) => boolean,
};

const defaultConfig : Config = { monitorProps: [] };

export default function withJob(work : Work, config : Config = defaultConfig) {
  if (typeof work !== 'function') {
    throw new Error('You must provide a "work" function to the "withJob".');
  }

  const { shouldWorkAgain } = config;

  return function wrapComponentWithJob(WrappedComponent : Function) {
    class ComponentWithJob extends Component {
      props: Props;
      state: State;
      unmounted: boolean;

      constructor(props : Props) {
        super(props);
        this.state = {
          inProgress: false,
          completed: false,
        };
      }

      componentWillMount() {
        const { jobInitState } = this.props;

        if (jobInitState) {
          this.setState(jobInitState);
          return;
        }

        this.handleWork(this.props);
      }

      componentWillUnmount() {
        this.unmounted = true;
      }

      componentWillReceiveProps(nextProps : Props) {
        if (!shouldWorkAgain
          || !shouldWorkAgain(
            propsWithoutInternal(this.props),
            propsWithoutInternal(nextProps),
            this.getJobState(),
          )
        ) {
          // User has explicitly stated no!
          return;
        }

        this.handleWork(nextProps);
      }

      handleWork(props : Props) {
        const { onJobProcessed } = this.props;
        let workResult;

        try {
          workResult = work(propsWithoutInternal(props));
        } catch (error) {
          // Either a syncrhnous error or an error setting up the asynchronous
          // promise.
          this.setState({ completed: true, error });
          return;
        }

        if (isPromise(workResult)) {
          workResult
            .then((result) => {
              if (!this.unmounted) {
                this.setState({ completed: true, inProgress: false, result });
              }
              return result;
            })
            .catch((error) => {
              if (!this.unmounted) {
                this.setState({ completed: true, inProgress: false, error });
              }
            })
            .then(() => {
              if (!this.unmounted && onJobProcessed) {
                onJobProcessed(this.getJobState());
              }
            });

          // Asynchronous result.
          this.setState({ completed: false, inProgress: true, executingJob: workResult });
        } else {
          // Synchronous result.
          this.setState({ completed: true, result: workResult });
        }
      }

      getExecutingJob() {
        return this.state.executingJob;
      }

      getJobState() : JobState {
        const { completed, inProgress, result, error } = this.state;
        return { completed, inProgress, result, error };
      }

      getPropsWithJobState(props : Object) {
        return Object.assign(
          {},
          // Do not pass down internal props
          propsWithoutInternal(props),
          { job: this.getJobState() },
        );
      }

      render() {
        return <WrappedComponent {...this.getPropsWithJobState(this.props)} />;
      }
    }
    ComponentWithJob.displayName = `${getDisplayName(WrappedComponent)}WithJob`;
    return ComponentWithJob;
  };
}
