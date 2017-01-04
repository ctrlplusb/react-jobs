/* @flow */

import React, { Component } from 'react';
import { getDisplayName } from './utils';

type Args = {
  work: Function,
};

type State = {
  result?: any,
  error?: any,
};

type Props = Object;

export default function job(args : Args) {
  if (typeof args !== 'object') {
    throw new Error('You must provide an options object to job()');
  }
  const { work } = args;
  if (typeof work !== 'function') {
    throw new Error('You must provide a work function to the job\'s options');
  }

  return function WrapComponentWithJob(WrappedComponent : Function) {
    class ComponentWithJob extends Component {
      props: Props;
      state: State;

      constructor(props : Props) {
        super(props);
        this.state = {};
      }

      componentWillMount() {
        const inProgress = work();
        if (typeof inProgress === 'undefined' || typeof inProgress.then !== 'function') {
          throw new Error('work(props) should return a Promise.');
        }
        inProgress.then(
          (result) => { this.setState({ result }); },
          (error) => {
            console.warn('Job failed:\n', error); // eslint-disable-line no-console
            this.setState({ error });
          },
        );
      }

      render() {
        const { result, error } = this.state;

        const jobProp = {
          loading: !result && !error,
          result,
          error,
        };

        return <WrappedComponent {...this.props} job={jobProp} />;
      }
    }
    ComponentWithJob.displayName = `${getDisplayName(WrappedComponent)}WithJob`;
    return ComponentWithJob;
  };
}
