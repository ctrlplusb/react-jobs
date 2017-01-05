/* @flow */

import React, { PropTypes } from 'react';
import { mount } from 'enzyme';
import type { ClientProviderContext } from '../../../src/server/types';

// Under test.
import ClientProvider from '../../../src/server/ClientProvider';

describe('<ClientProvider />', () => {
  describe('context', () => {
    it('should provide a unique number for every nextJobID() execution', () => {
      let actualJobID;
      const Foo = (props, context : ClientProviderContext) => {
        actualJobID = context.reactJobsClient.nextJobID();
        return <div>foo</div>;
      };
      Foo.contextTypes = { reactJobsClient: PropTypes.object.isRequired };
      const app = <ClientProvider><Foo /></ClientProvider>;
      mount(app);
      expect(actualJobID).toEqual(1);
      mount(app);
      expect(actualJobID).toEqual(2);
    });
  });
});
