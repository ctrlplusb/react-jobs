/* @flow */

import { Children, Component, Element, PropTypes } from 'react';
import type { ServerProviderContext, RenderContext } from './types';

type React$Element = Element<*>;

type Props = {
  children?: React$Element,
  renderContext: RenderContext,
};

let currentjobID = 0;
const jobResults = {};

class ServerProvider extends Component {
  props: Props;

  getChildContext() {
    const context : ServerProviderContext = {
      reactJobsServer: {
        nextJobID: () => {
          currentjobID += 1;

          if (this.props.renderContext) {
            this.props.renderContext.setCurrentJobID(currentjobID);
          }

          return currentjobID;
        },
        registerJobResults: (jobID: number, results: any) => {
          jobResults[jobID] = results;
          if (this.props.renderContext) {
            this.props.renderContext.registerResolvedJob(jobID);
          }
        },
        getJobResults: (jobID: number) => jobResults[jobID],
      },
    };

    return context;
  }

  render() {
    return Children.only(this.props.children);
  }
}

ServerProvider.childContextTypes = {
  reactJobs: PropTypes.object.isRequired,
};

export default ServerProvider;
