/* @flow */

import React from 'react';
import { mount } from 'enzyme';
import { job, runJobs } from '../../../src/ssr';
import { Foo, resolveAfter, rejectAfter } from '../../helpers';

const workTime = 10; // ms

describe('runJobs()', () => {
  it('should return a Promise', () => {
    const actual = runJobs(<div>foo</div>);
    expect(actual.then).toBeTruthy();
  });

  it('should render a job that succeeds', () => {
    const FooWithJob = job(() => resolveAfter(workTime, 'Hello world!'))(Foo);
    const app = <FooWithJob />;
    return runJobs(app).then(({ app: wrappedApp }) => {
      expect(mount(wrappedApp)).toMatchSnapshot();
    });
  });

  it('should render a job that fails', () => {
    const FooWithJob = job(() => rejectAfter(workTime, 'Poop!'))(Foo);
    const app = <FooWithJob />;
    return runJobs(app).then(({ app: wrappedApp }) => {
      expect(mount(wrappedApp)).toMatchSnapshot();
    });
  });

  it('should not render a job that is deferred', () => {
    const FooWithJob = job(
      () => resolveAfter(workTime, 'Hello world!'),
      { defer: true },
    )(Foo);
    const app = <FooWithJob />;
    return runJobs(app).then(({ app: wrappedApp }) => {
      expect(mount(wrappedApp)).toMatchSnapshot();
    });
  });
});
