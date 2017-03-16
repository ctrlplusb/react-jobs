/*  */

import React, { PropTypes } from 'react'
import { mount } from 'enzyme'

// Under test.
import ClientProvider from '../ClientProvider'

describe('<ClientProvider />', () => {
  describe('context', () => {
    it('should provide a unique number for every nextJobID() execution', () => {
      let actualJobID1
      let actualJobID2
      const Foo = (props, context) => {
        actualJobID1 = context.reactJobsClient.nextJobID()
        actualJobID2 = context.reactJobsClient.nextJobID()
        return <div>foo</div>
      }
      Foo.contextTypes = { reactJobsClient: PropTypes.object.isRequired }
      const app = <ClientProvider><Foo /></ClientProvider>
      mount(app)
      expect(actualJobID1).toEqual(1)
      expect(actualJobID2).toEqual(2)
    })
  })
})
