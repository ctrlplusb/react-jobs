import React from 'react'
import { mount } from 'enzyme'
import {
  resolveAfter,
  rejectAfter,
  warningsToErrors,
} from '../../tools/tests/helpers'
import withJob from '../withJob'

const workTime = 10 // ms

function ResultRenderer({ jobResult, children }) {
  return (
    <div>
      {jobResult}
      {children &&
        <div>
          {children}
        </div>}
    </div>
  )
}
const ErrorComponent = ({ error }) => <div>{error ? error.message : null}</div>
const LoadingComponent = () => <div>Loading...</div>

describe('withJob()', () => {
  warningsToErrors()

  describe('arguments', () => {
    it('returns a function', () => {
      const actual = typeof withJob({ work: () => undefined })
      const expected = 'function'
      expect(actual).toEqual(expected)
    })

    it('should throws if no config is provided', () => {
      expect(() => withJob()).toThrowError(
        'You must provide a config object to withJob',
      )
    })

    it('should throws if the work is invalid', () => {
      // $FlowIgnore: we expect this to flow error
      expect(() => withJob({ work: 1 })).toThrowError(
        'You must provide a work function to withJob',
      )
    })
  })

  describe('higher order component', () => {
    const hoc = withJob({ work: () => resolveAfter(1) })
    const Actual = hoc(ResultRenderer)

    it('should return a renderable component', () => {
      expect(() => mount(<Actual />)).not.toThrowError()
    })
  })

  describe('rendering', () => {
    it('should set the "result" immediately if the work does not return a promise', () => {
      const ResultRendererWithJob = withJob({ work: () => 'bob' })(
        ResultRenderer,
      )
      expect(mount(<ResultRendererWithJob />)).toMatchSnapshot()
    })

    it('should provide the props to the work function', () => {
      const expected = { foo: 'bar', baz: 'qux' }
      let actual
      const ResultRendererWithJob = withJob({
        work: (props) => {
          actual = props
        },
      })(ResultRenderer)
      mount(<ResultRendererWithJob {...expected} />)
      expect(actual).toMatchObject(expected)
    })

    it('should render nothing when processing work', () => {
      const ResultRendererWithJob = withJob({
        work: () => resolveAfter(workTime),
      })(ResultRenderer)
      const actual = mount(<ResultRendererWithJob />)
      expect(actual).toMatchSnapshot()
    })

    it('should render LoadingComponent when processing work', () => {
      const ResultRendererWithJob = withJob({
        work: () => resolveAfter(workTime),
        LoadingComponent,
      })(ResultRenderer)
      const actual = mount(<ResultRendererWithJob />)
      expect(actual).toMatchSnapshot()
    })

    it('should render wrapped component when work completes successfully', () => {
      const ResultRendererWithJob = withJob({
        work: () => resolveAfter(workTime, 'result'),
      })(ResultRenderer)
      const renderWrapper = mount(<ResultRendererWithJob />)
      // Allow enough time for work to complete
      return resolveAfter(workTime + 5).then(() => {
        expect(renderWrapper).toMatchSnapshot()
      })
    })

    it('should render ErrorComponent when async work fails', () => {
      const error = new Error('poop')
      const ResultRendererWithJob = withJob({
        work: () => rejectAfter(workTime, error),
        ErrorComponent,
      })(ResultRenderer)
      const renderWrapper = mount(<ResultRendererWithJob />)
      // Allow enough time for work to complete
      return resolveAfter(workTime + 5 + 16).then(() => {
        expect(renderWrapper).toMatchSnapshot()
      })
    })

    it('should set "error" when synchronous work fails', () => {
      const error = new Error('poop')
      const ResultRendererWithJob = withJob({
        work: () => {
          throw error
        },
        ErrorComponent,
      })(ResultRenderer)
      const renderWrapper = mount(<ResultRendererWithJob />)
      // Allow enough time for error state to be set
      return resolveAfter(16 + 1).then(() => {
        expect(renderWrapper).toMatchSnapshot()
      })
    })

    it('should not fire again when no "config.shouldWorkAgain" is provided', () => {
      let fireCount = 0
      const Component = withJob({
        work: () => {
          fireCount += 1
          return 'foo'
        },
      })(() => <div>bob</div>)
      const renderWrapper = mount(<Component foo="foo" />)
      expect(fireCount).toEqual(1)
      // Set props to cause a re-render
      renderWrapper.setProps({ foo: 'bar' })
      expect(fireCount).toEqual(1)
    })

    it('should fire again for a remount', () => {
      let fireCount = 0
      const Component = withJob({
        work: () => {
          fireCount += 1
          return true
        },
      })(() => <div>bob</div>)
      mount(<Component />)
      expect(fireCount).toEqual(1)
      mount(<Component />)
      expect(fireCount).toEqual(2)
    })

    it('should fire expectantly for a "shouldWorkAgain" implementation', () => {
      const prevProductIds = []
      let fireCount = 0
      const Component = withJob({
        work: ({ productId }) => {
          prevProductIds.push(productId)
          fireCount += 1
          return true
        },
        shouldWorkAgain: (prevProps, nextProps, currentJob) =>
          (currentJob.inProgress || currentJob.completed) &&
          prevProductIds.indexOf(nextProps.productId) === -1,
      })(() => <div>bob</div>)
      const renderWrapper = mount(<Component productId={1} />)
      expect(fireCount).toEqual(1)
      renderWrapper.setProps({ productId: 2 })
      expect(fireCount).toEqual(2)
      renderWrapper.setProps({ productId: 3 })
      expect(fireCount).toEqual(3)
      renderWrapper.setProps({ productId: 2 })
      expect(fireCount).toEqual(3)
      renderWrapper.setProps({ productId: 1 })
      expect(fireCount).toEqual(3)
    })
  })
})
