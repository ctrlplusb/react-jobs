import React from 'react'
import { mount } from 'enzyme'
import { withJob } from '../../'
import workAgainForMonitoredProps from '../workAgainForMonitoredProps'

let fireCount = 0

const createComponent = config =>
  withJob({
    work: () => {
      fireCount += 1
      return true
    },
    shouldWorkAgain: workAgainForMonitoredProps(config),
  })(() => <div>bob</div>)

beforeEach(() => {
  fireCount = 0
})

describe('workAgainForMonitoredProps', () => {
  it('should fire when a monitor prop changes', () => {
    const Bob = createComponent(['productId'])
    const renderWrapper = mount(<Bob productId={1} />)
    expect(fireCount).toEqual(1)
    renderWrapper.setProps({ productId: 2 })
    expect(fireCount).toEqual(2)
    renderWrapper.setProps({ productId: 3 })
    expect(fireCount).toEqual(3)
    renderWrapper.setProps({ productId: 2 })
    expect(fireCount).toEqual(4)
    renderWrapper.setProps({ productId: 2 })
    expect(fireCount).toEqual(4)
  })

  it('should fire when any of multiple monitor props change', () => {
    const Bob = createComponent(['searchTerm', 'searchLimit'])
    const renderWrapper = mount(<Bob searchTerm="foo" searchLimit={10} />)
    expect(fireCount).toEqual(1)
    renderWrapper.setProps({ searchTerm: 'foo', searchLimit: 10 })
    expect(fireCount).toEqual(1)
    renderWrapper.setProps({ searchTerm: 'bar', searchLimit: 10 })
    expect(fireCount).toEqual(2)
    renderWrapper.setProps({ searchTerm: 'bar', searchLimit: 20 })
    expect(fireCount).toEqual(3)
    renderWrapper.setProps({ searchTerm: 'bar', searchLimit: 20 })
    expect(fireCount).toEqual(3)
  })

  it('should fire when a dot-notation object monitor prop changes', () => {
    const Bob = createComponent(['params.productId'])
    const renderWrapper = mount(<Bob params={{ productId: 1 }} />)
    expect(fireCount).toEqual(1)
    renderWrapper.setProps({ params: { productId: 2 } })
    expect(fireCount).toEqual(2)
    renderWrapper.setProps({ params: { productId: 3 } })
    expect(fireCount).toEqual(3)
    renderWrapper.setProps({ params: { productId: 2 } })
    expect(fireCount).toEqual(4)
    renderWrapper.setProps({ params: { productId: 2 } })
    expect(fireCount).toEqual(4)
  })
})
