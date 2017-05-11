import React, { Component } from 'react'
import PropTypes from 'prop-types'

import createJobContext from './createJobContext'

class JobProvider extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    jobContext: PropTypes.shape({
      getNextId: PropTypes.func.isRequired,
      resetIds: PropTypes.func.isRequired,
      register: PropTypes.func.isRequired,
      get: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired,
    }),
    rehydrateState: PropTypes.shape({
      jobs: PropTypes.object.isRequired,
    }),
  }

  static defaultProps = {
    jobContext: null,
    rehydrateState: {
      jobs: {},
    },
  }

  static childContextTypes = {
    jobs: PropTypes.shape({
      getNextId: PropTypes.func.isRequired,
      register: PropTypes.func.isRequired,
      get: PropTypes.func.isRequired,
      getRehydrate: PropTypes.func.isRequired,
      removeRehydrate: PropTypes.func.isRequired,
    }).isRequired,
  }

  constructor(props, context) {
    super(props, context)

    // This is a workaround because each element instance of a job needs its
    // own ids.  So between the bootstrapping and the render we need to reset
    // the id counter to ensure the ids will match.
    if (props.jobContext) {
      props.jobContext.resetIds()
    }
  }

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
        getRehydrate: id => this.rehydrateState.jobs[id],
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
