import React from 'react'
import { mount } from 'enzyme'
import { withJob, runJobs } from '../'
import { Foo, resolveAfter, rejectAfter } from '../../../tools/tests/helpers'

const workTime = 10 // ms

describe('runJobs()', () => {
  it('should return a Promise', () => {
    const actual = runJobs(<div>foo</div>)
    expect(actual.then).toBeTruthy()
  })

  it('should render a job that succeeds', () => {
    const FooWithJob = withJob(() => resolveAfter(workTime, 'Hello world!'))(
      Foo,
    )
    const app = <FooWithJob />
    return runJobs(app).then(({ appWithJobs }) => {
      expect(mount(appWithJobs)).toMatchSnapshot()
    })
  })

  it('should render a job that fails', () => {
    const FooWithJob = withJob(() => rejectAfter(workTime, 'Poop!'))(Foo)
    const app = <FooWithJob />
    return runJobs(app).then(({ appWithJobs }) => {
      expect(mount(appWithJobs)).toMatchSnapshot()
    })
  })

  it('should not render a job that is deferred', () => {
    const FooWithJob = withJob(() => resolveAfter(workTime, 'Hello world!'), {
      defer: true,
    })(Foo)
    const app = <FooWithJob />
    return runJobs(app).then(({ appWithJobs }) => {
      expect(mount(appWithJobs)).toMatchSnapshot()
    })
  })
})
