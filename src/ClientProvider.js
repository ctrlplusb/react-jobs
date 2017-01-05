/* @flow */

import { Children, Component, Element, PropTypes } from 'react';
import type { ClientProviderContext } from './types';

type React$Element = Element<*>;

type Props = {
  children?: React$Element,
  state?: Object,
};

let currentjobID = 0;

class ClientProvider extends Component {
  props: Props;

  getChildContext() {
    const context : ClientProviderContext = {
      reactJobsClient: {
        nextJobID: () => {
          currentjobID += 1;
          return currentjobID;
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
  reactJobs: PropTypes.object.isRequired,
};

export default ClientProvider;
