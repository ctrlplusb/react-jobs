/* @flow */

import React, { PropTypes } from 'react';
import { mount } from 'enzyme';
import type { ServerProviderContext } from '../../../src/ssr/types';

// Under test.
import ServerProvider from '../../../src/ssr/ServerProvider';

describe('<ServerProvider />', () => {
  describe('context', () => {
    it('should provide a unique number for every nextJobID() execution', () => {
      let actualJobID;
      const Foo = (props, context : ServerProviderContext) => {
        actualJobID = context.reactJobsServer.nextJobID();
        return <div>foo</div>;
      };
      Foo.contextTypes = { reactJobsServer: PropTypes.object.isRequired };
      const app = <ServerProvider><Foo /></ServerProvider>;
      mount(app);
      expect(actualJobID).toEqual(1);
      mount(app);
      expect(actualJobID).toEqual(2);
    });

    it('should allow registering/fetching of job state', () => {
      const expected = { inProgress: false, result: 'foo' };
      let actual;
      const jobID = 1;
      const Foo = (props, context : ServerProviderContext) => {
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
