/* @flow */

import { Children, Component, Element, PropTypes } from 'react';
import type { ClientProviderContext, RehydrateState } from './types';

type React$Element = Element<*>;

type Props = {
  children?: React$Element,
  ssrState?: RehydrateState,
};

let currentjobID = 0;

class ClientProvider extends Component {
  props: Props;
  ssrState: ?RehydrateState;

  constructor(props : Props) {
    super(props);
    if (props.ssrState) {
      this.ssrState = props.ssrState;
    }
  }

  getChildContext() {
    const context : ClientProviderContext = {
      reactJobsClient: {
        nextJobID: () => {
          currentjobID += 1;
          return currentjobID;
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
