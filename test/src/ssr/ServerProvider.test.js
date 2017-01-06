/* @flow */

import React, { PropTypes } from 'react';
import { mount } from 'enzyme';
import type { ServerProviderChildContext } from '../../../src/ssr/types';

// Under test.
import ServerProvider from '../../../src/ssr/ServerProvider';

describe('<ServerProvider />', () => {
  describe('context', () => {
    it('should allow registering/fetching of job state', () => {
      const expected = { inProgress: false, result: 'foo' };
      let actual;
      const jobID = 1;
      const Foo = (props, context : ServerProviderChildContext) => {
        context.reactJobsServer.registerJobState(jobID, expected);
        actual = context.reactJobsServer.getJobState(jobID);
        return <div>foo</div>;
      };
      Foo.contextTypes = { reactJobsServer: PropTypes.object.isRequired };
      const app = <ServerProvider><Foo /></ServerProvider>;
      mount(app);
      expect(actual).toMatchObject(expected);
    });
  });
});
