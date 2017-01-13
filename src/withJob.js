/* @flow */

// eslint-disable-next-line import/no-extraneous-dependencies
import React, { Component } from 'react';
import shallowEqual from 'fbjs/lib/shallowEqual';
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
  monitorProps : Array<string>,
};

const getMonitorState = (props : Object) => Object.keys(props).reduce((acc, cur) =>
  Object.assign(acc, { [cur]: props[cur] }),
  {},
);

const defaultConfig : Config = { monitorProps: [] };

export default function withJob(work : Work, config : Config = defaultConfig) {
  if (typeof work !== 'function') {
    throw new Error('You must provide a "createWork" function to the "withJob".');
  }

  const { monitorProps } = config;

  return function wrapComponentWithJob(WrappedComponent : Function) {
    class ComponentWithJob extends Component {
      props: Props;
      state: State;

      constructor(props : Props) {
        super(props);
        this.state = {
          inProgress: false,
          completed: false,
        };
      }

      componentWillMount() {
        const { jobInitState } = this.props;

        if (monitorProps.length > 0) {
          const monitorState = getMonitorState(this.props);
          this.setState({ monitorState });
        }

        if (jobInitState) {
          this.setState(jobInitState);
          return;
        }

        this.handleWork(this.props);
      }

      componentWillReceiveProps(nextProps : Props) {
        const monitorPropChanged = () => {
          if (monitorProps.length === 0 || !this.state.monitorState) {
            return false;
          }
          const newState = getMonitorState(nextProps);
          this.setState({ monitorState: newState });
          return !shallowEqual(this.state.monitorState, newState);
        };
        if (!monitorPropChanged() && (this.state.inProgress || this.state.completed)) {
          // We don't want to fire work under these conditions.
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
              this.setState({ completed: true, inProgress: false, result });
              return result;
            })
            .catch((error) => {
              this.setState({ completed: true, inProgress: false, error });
            })
            .then(() => {
              if (onJobProcessed) {
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

      render() {
        // Do not pass down internal props
        const jobState = this.getJobState();
        return (
          <WrappedComponent
            {...propsWithoutInternal(this.props)}
            job={jobState}
          />
        );
      }
    }
    ComponentWithJob.displayName = `${getDisplayName(WrappedComponent)}WithJob`;
    return ComponentWithJob;
  };
}
