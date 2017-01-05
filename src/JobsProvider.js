/* @flow */

import { Children, Component, Element, PropTypes } from 'react';
import type { ProviderContext } from './sharedTypes';

type React$Element = Element<*>;

type Props = {
  children?: React$Element,
};

let currentjobID = 0;
const jobResults = {};

const context : ProviderContext = {
  reactJobs: {
    nextJobID: () => {
      currentjobID += 1;
      return currentjobID;
    },
    registerJobResults: (jobID: number, results: any) => {
      jobResults[jobID] = results;
    },
    getJobResults: (jobID: number) => jobResults[jobID],
  },
};

class JobsProvider extends Component {
  props: Props;

  getChildContext() {
    return context;
  }

  render() {
    return Children.only(this.props.children);
  }
}

JobsProvider.childContextTypes = {
  reactJobs: PropTypes.object.isRequired,
};

export default JobsProvider;
