/* @flow */

import React, { PropTypes } from 'react';
import { mount } from 'enzyme';
import type { ReactJobsContext } from '../../src/types';

// Under test.
import ClientProvider from '../../src/ClientProvider';

describe('<ClientProvider />', () => {
  describe('context', () => {
    it('should provide a unique number for every nextJobID() execution', () => {
      let actualJobID;
      const Foo = (props, context : ReactJobsContext) => {
        actualJobID = context.reactJobs.nextJobID();
        return <div>foo</div>;
      };
      Foo.contextTypes = { reactJobs: PropTypes.object.isRequired };
      const app = <ClientProvider><Foo /></ClientProvider>;
      mount(app);
      expect(actualJobID).toEqual(1);
      mount(app);
      expect(actualJobID).toEqual(2);
    });

    it('should allow registering/fetching of job result', () => {
      const expected = { foo: 'foo' };
      let actual;
      const jobID = 1;
      const Foo = (props, context : ReactJobsContext) => {
        context.reactJobs.registerJobResults(jobID, expected);
        actual = context.reactJobs.getJobResults(jobID);
        return <div>foo</div>;
      };
      Foo.contextTypes = { reactJobs: PropTypes.object.isRequired };
      const app = <ClientProvider><Foo /></ClientProvider>;
      mount(app);
      expect(actual).toMatchObject(expected);
    });
  });
});
