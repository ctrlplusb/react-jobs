import React, { Component, PropTypes } from 'react'

import createJobContext from './createJobContext'

class JobProvider extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    jobContext: PropTypes.shape({
      getNextId: PropTypes.func.isRequired,
      register: PropTypes.func.isRequired,
      get: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired,
    }),
    rehydrateState: PropTypes.shape({
      jobs: PropTypes.object.isRequired,
    }),
  };

  static defaultProps = {
    jobContext: null,
    rehydrateState: {
      jobs: {},
    },
  };

  static childContextTypes = {
    jobs: PropTypes.shape({
      getNextId: PropTypes.func.isRequired,
      register: PropTypes.func.isRequired,
      get: PropTypes.func.isRequired,
      getRehydrate: React.PropTypes.func.isRequired,
      removeRehydrate: React.PropTypes.func.isRequired,
    }).isRequired,
  };

  componentWillMount() {
    this.jobContext = this.props.jobContext || createJobContext()
    this.rehydrateState = this.props.rehydrateState
  }

  getChildContext() {
    return {
      jobs: {
        getNextId: this.jobContext.getNextId,
        register: this.jobContext.register,
        get: this.jobContext.get,
        getRehydrate: (id) => {
          const rehydration = this.rehydrateState.jobs[id]
          delete this.rehydrateState.jobs[id]
          return rehydration
        },
        removeRehydrate: (id) => {
          delete this.rehydrateState.jobs[id]
        },
      },
    }
  }

  render() {
    return React.Children.only(this.props.children)
  }
}

export default JobProvider
