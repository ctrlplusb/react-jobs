/* @flow */

import React from 'react';
import { mount } from 'enzyme';
import { job } from '../../../src/ssr';
import { Foo, resolveAfter } from '../../helpers';

// Under test.
import runJobs from '../../../src/ssr/runJobs';

const workTime = 10; // ms

describe('runJobs()', () => {
  it('should return a Promise', () => {
    const actual = runJobs(<div>foo</div>);
    expect(actual.then).toBeTruthy();
  });

  it('should render simple job with success', () => {
    const FooWithJob = job(() => resolveAfter(workTime, 'Hello world!'))(Foo);
    const app = <FooWithJob />;
    return runJobs(app).then(({ app: wrappedApp }) => {
      expect(mount(wrappedApp)).toMatchSnapshot();
    });
  });
});
