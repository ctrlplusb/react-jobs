/* @flow */

import React, { PropTypes } from 'react';
import { mount } from 'enzyme';
import type { ProviderContext } from '../src/sharedTypes';

// Under test.
import JobsProvider from '../src/JobsProvider';

describe('<JobsProvider />', () => {
  describe('context', () => {
    it('should provide a unique number for every nextJobID() execution', () => {
      let actualJobID;
      const Foo = (props, context : ProviderContext) => {
        actualJobID = context.reactJobs.nextJobID();
        return <div>foo</div>;
      };
      Foo.contextTypes = { reactJobs: PropTypes.object.isRequired };
      const app = <JobsProvider><Foo /></JobsProvider>;
      mount(app);
      expect(actualJobID).toEqual(1);
      mount(app);
      expect(actualJobID).toEqual(2);
    });

    it('should allow registering/fetching of job result', () => {
      const expected = { foo: 'foo' };
      let actual;
      const jobID = 1;
      const Foo = (props, context : ProviderContext) => {
        context.reactJobs.registerJobResults(jobID, expected);
        actual = context.reactJobs.getJobResults(jobID);
        return <div>foo</div>;
      };
      Foo.contextTypes = { reactJobs: PropTypes.object.isRequired };
      const app = <JobsProvider><Foo /></JobsProvider>;
      mount(app);
      expect(actual).toMatchObject(expected);
    });
  });
});
