/* @flow */

import React from 'react';
import { mount } from 'enzyme';
import JobsProvider from '../src/JobsProvider';
import job from '../src/job';
import { Foo, resolveAfter } from './__helpers__';

// Under test.
import runJobs from '../src/runJobs';

const workTime = 10; // ms

describe('runJobs()', () => {
  it('should return a Promise', () => {
    const actual = runJobs(<div>foo</div>);
    expect(actual.then).toBeTruthy();
  });

  describe('integration', () => {
    it('should render simple job with success', () => {
      const FooWithJob = job(() => resolveAfter(workTime, 'bob'))(Foo);
      const app = (
        <JobsProvider>
          <FooWithJob />
        </JobsProvider>
      );
      return runJobs(app).then(() => {
        expect(mount(app)).toMatchSnapshot();
      });
    });
  });
});
