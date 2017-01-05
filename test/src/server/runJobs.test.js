/* @flow */

import React from 'react';
import { mount } from 'enzyme';
import { ServerProvider, job } from '../../../src/ssr';
import { Foo, resolveAfter } from '../../__helpers__';

// Under test.
import runJobs from '../../../src/ssr/runJobs';

const workTime = 10; // ms

describe('runJobs()', () => {
  it('should return a Promise', () => {
    const actual = runJobs(<div>foo</div>);
    expect(actual.then).toBeTruthy();
  });

  it.only('should render simple job with success', () => {
    const FooWithJob = job(() => resolveAfter(workTime, 'Hello world!'))(Foo);
    const app = <ServerProvider><FooWithJob /></ServerProvider>;
    return runJobs(app).then(() => {
      expect(mount(app)).toMatchSnapshot();
    });
  });
});
