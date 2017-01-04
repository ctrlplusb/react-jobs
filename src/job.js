/* @flow */

import React, { Component } from 'react';
import { getDisplayName } from './utils';

type Work = (props : Object) => any;

type State = {
  inProgress: boolean,
  result?: any,
  error?: any,
};

type Props = Object;

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
        const x = work(this.props);

        if (typeof x === 'undefined' || typeof x.then !== 'function') {
          // Synchronous result.
          this.setState({ result: x });
        } else {
          // Asynchronous result.
          this.setState({ inProgress: true });

          // Resolve the promise...
          x
            .then((result) => { this.setState({ inProgress: false, result }); })
            .catch((error) => {
              console.warn('Job failed:\n', error); // eslint-disable-line no-console
              this.setState({ inProgress: false, error });
            });
        }
      }

      render() {
        const jobProp = Object.assign({}, this.state);
        return <WrappedComponent {...this.props} job={jobProp} />;
      }
    }
    ComponentWithJob.displayName = `${getDisplayName(WrappedComponent)}WithJob`;
    return ComponentWithJob;
  };
}
