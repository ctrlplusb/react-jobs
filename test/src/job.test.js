/* @flow */

import React from 'react';
import { shallow, mount } from 'enzyme';
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
    const actual = hoc(Foo);

    it('should return a "class" component', () => {
      // You can do the below to check for a class component.
      // @see http://bit.ly/2hSf2be
      expect(typeof actual).toEqual('function');
      expect(actual.prototype).toBeDefined();
      // $FlowIgnore
      expect(actual.prototype.isReactComponent).toBeTruthy();
    });

    it('should set the expected displayName', () => {
      expect(actual.displayName).toEqual('FooWithJob');
    });
  });

  describe('rendering', () => {
    it.only('should set the "result" immediately if the work does not return a promise', () => {
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
      const actual = shallow(<FooWithJob />).find(Foo).props();
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
