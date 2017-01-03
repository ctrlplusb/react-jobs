import React, { Component } from 'react';
import { getDisplayName } from './utils';

export default function job(args) {
  if (typeof args !== 'object') {
    throw new Error('You must provide an options object to job()');
  }
  const { work, OnError, OnWorking } = args;
  if (typeof work !== 'function') {
    throw new Error('You must provide a work function to the job\'s options');
  }

  return function WrapComponentWithJob(WrappedComponent) {
    class ComponentWithJob extends Component {
      constructor(props) {
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

        if (error) {
          return OnError ? <OnError {...this.props} /> : <div>Job Failed</div>;
        }

        if (result) {
          return <WrappedComponent {...result} />;
        }

        return OnWorking
          ? <OnWorking {...this.props} />
          : null;
      }
    }
    ComponentWithJob.displayName = `${getDisplayName(WrappedComponent)}WithJob`;
    return ComponentWithJob;
  };
}
