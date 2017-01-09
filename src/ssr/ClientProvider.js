/* @flow */

// eslint-disable-next-line import/no-extraneous-dependencies
import { Children, Component, PropTypes } from 'react';
import type {
  ClientProviderChildContext,
  RehydrateState,
  React$Element,
} from './types';

type Props = {
  children?: React$Element,
  ssrState?: RehydrateState,
};

class ClientProvider extends Component {
  props: Props;
  jobCounter: number;
  ssrState: ?RehydrateState;

  constructor(props : Props) {
    super(props);
    if (props.ssrState) {
      this.ssrState = props.ssrState;
    }
    this.jobCounter = 0;
  }

  getChildContext() {
    const context : ClientProviderChildContext = {
      reactJobsClient: {
        nextJobID: () => {
          this.jobCounter += 1;
          return this.jobCounter;
        },
        popJobRehydrationForSRR: (jobID) => {
          if (this.ssrState) {
            const result = this.ssrState.jobsState[jobID];
            if (result) {
              delete this.ssrState.jobsState[jobID];
              return result;
            }
          }
          return undefined;
        },
      },
    };

    return context;
  }

  render() {
    return Children.only(this.props.children);
  }
}

ClientProvider.childContextTypes = {
  reactJobsClient: PropTypes.object.isRequired,
};

export default ClientProvider;
