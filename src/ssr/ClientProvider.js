/*  */

// eslint-disable-next-line import/no-extraneous-dependencies
import { Children, Component, PropTypes } from 'react'

class ClientProvider extends Component {
  constructor(props) {
    super(props)
    if (props.ssrState) {
      this.ssrState = props.ssrState
    }
    this.jobCounter = 0
  }

  getChildContext() {
    const context = {
      reactJobsClient: {
        nextJobID: () => {
          this.jobCounter += 1
          return this.jobCounter
        },
        popJobRehydrationForSRR: (jobID) => {
          if (this.ssrState) {
            const result = this.ssrState.jobsState[jobID]
            if (result) {
              delete this.ssrState.jobsState[jobID]
              return result
            }
          }
          return undefined
        },
      },
    }

    return context
  }

  render() {
    return Children.only(this.props.children)
  }
}

ClientProvider.childContextTypes = {
  reactJobsClient: PropTypes.object.isRequired,
}

export default ClientProvider
