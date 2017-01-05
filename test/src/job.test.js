/* @flow */

import React from 'react';
import { mount } from 'enzyme';
import { Foo, resolveAfter, rejectAfter, warningsAsErrors } from '../__helpers__';
import ServerProvider from '../../src/server/ServerProvider';

// Under Test.
import job from '../../src/job';

const workTime = 10; // ms

describe('job()', () => {
  warningsAsErrors();

  describe('options', () => {
    it('returns a function', () => {
      const actual = typeof job(() => undefined);
      const expected = 'function';
      expect(actual).toEqual(expected);
    });

    it('should throws if no work is provided', () => {
      // $FlowIgnore: we expect this to flow error
      expect(() => job()).toThrowError(/provide a function to a react-jobs/);
    });

    it('should throws if the work is invalid', () => {
      // $FlowIgnore: we expect this to flow error
      expect(() => job(1)).toThrowError(/provide a function to a react-jobs/);
    });
  });

  describe('higher order component', () => {
    const hoc = job(() => resolveAfter(1));
    const Actual = hoc(Foo);

    it('should return a renderable component', () => {
      expect(() => mount(<Actual />)).not.toThrowError();
    });
  });

  describe('rendering', () => {
    it('should set the "result" immediately if the work does not return a promise', () => {
      const FooWithJob = job(() => 'bob')(Foo);
      expect(mount(<ServerProvider><FooWithJob /></ServerProvider>)).toMatchSnapshot();
    });

    it('should provide the props to the work function', () => {
      const expected = { foo: 'bar', baz: 'qux' };
      let actual;
      const FooWithJob = job((props) => { actual = props; })(Foo);
      mount(<FooWithJob {...expected} />);
      expect(actual).toMatchObject(expected);
    });

    it('should set "inProgress" when processing work', () => {
      const FooWithJob = job(() => resolveAfter(workTime))(Foo);
      const actual = mount(<FooWithJob />).find(Foo).props();
      const expected = { job: { inProgress: true } };
      expect(actual).toMatchObject(expected);
    });

    it('should set "result" when work completes successfully', () => {
      const FooWithJob = job(() => resolveAfter(workTime, 'result'))(Foo);
      const renderWrapper = mount(<FooWithJob />);
      // Allow enough time for work to complete
      return resolveAfter(workTime + 5).then(() => {
        const actual = renderWrapper.find(Foo).props();
        const expected = { job: { inProgress: false, result: 'result' } };
        expect(actual).toMatchObject(expected);
      });
    });

    it('should set "error" when work fails', () => {
      const FooWithJob = job(() => rejectAfter(workTime, 'error'))(Foo);
      const renderWrapper = mount(<FooWithJob />);
      // Allow enough time for work to complete
      return resolveAfter(workTime + 5).then(() => {
        const actual = renderWrapper.find(Foo).props();
        const expected = { job: { inProgress: false, error: 'error' } };
        expect(actual).toMatchObject(expected);
      });
    });
  });
});
