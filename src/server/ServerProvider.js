/* @flow */

import { Children, Component, Element, PropTypes } from 'react';
import type { ServerProviderContext, RenderContext, JobState } from './types';

type React$Element = Element<*>;

type Props = {
  children?: React$Element,
  renderContext?: RenderContext,
};

let currentjobID = 0;
const jobStates : { [key : number] : JobState } = {};

class ServerProvider extends Component {
  props: Props;

  getChildContext() {
    const context : ServerProviderContext = {
      reactJobsServer: {
        nextJobID: () => {
          currentjobID += 1;
          return currentjobID;
        },
        registerJobState: (jobID: number, jobState: JobState) => {
          jobStates[jobID] = jobState;
          if (this.props.renderContext) {
            this.props.renderContext.registerJobState(jobID, jobState);
          }
        },
        getJobState: (jobID: number) => jobStates[jobID],
      },
    };

    return context;
  }

  render() {
    return Children.only(this.props.children);
  }
}

ServerProvider.childContextTypes = {
  reactJobsServer: PropTypes.object.isRequired,
};

export default ServerProvider;
