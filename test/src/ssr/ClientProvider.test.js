/* @flow */

import React, { PropTypes } from 'react';
import { mount } from 'enzyme';
import type { ClientProviderChildContext } from '../../../src/ssr/types';

// Under test.
import ClientProvider from '../../../src/ssr/ClientProvider';

describe('<ClientProvider />', () => {
  describe('context', () => {
    it('should provide a unique number for every nextJobID() execution', () => {
      let actualJobID1;
      let actualJobID2;
      const Foo = (props, context : ClientProviderChildContext) => {
        actualJobID1 = context.reactJobsClient.nextJobID();
        actualJobID2 = context.reactJobsClient.nextJobID();
        return <div>foo</div>;
      };
      Foo.contextTypes = { reactJobsClient: PropTypes.object.isRequired };
      const app = <ClientProvider><Foo /></ClientProvider>;
      mount(app);
      expect(actualJobID1).toEqual(1);
      expect(actualJobID2).toEqual(2);
    });
  });
});
