/*  */

// eslint-disable-next-line import/no-extraneous-dependencies
import React, { Component, PropTypes } from 'react'
import ClientProvider from './ClientProvider'

class ServerProvider extends Component {
  constructor(props) {
    super(props)
    if (props.runJobsExecContext) {
      this.jobStates = props.runJobsExecContext.getState().jobsState
    } else {
      this.jobStates = {}
    }
  }

  getChildContext() {
    const context = {
      reactJobsServer: {
        registerJobState: (jobID, jobState) => {
          this.jobStates[jobID] = jobState
          if (this.context.runJobsExecContext) {
            this.context.runJobsExecContext.registerJobState(jobID, jobState)
          }
        },
        getJobState: jobID => this.jobStates[jobID],
      },
    }

    return context
  }

  render() {
    return (
      <ClientProvider>
        {this.props.children}
      </ClientProvider>
    )
  }
}

ServerProvider.contextTypes = {
  reactJobsRunner: PropTypes.object,
}
ServerProvider.childContextTypes = {
  reactJobsServer: PropTypes.object.isRequired,
}

export default ServerProvider
