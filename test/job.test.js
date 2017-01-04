/* @flow */

import React from 'react';
import { shallow, mount } from 'enzyme';
import { warningsAsErrors } from './__helpers__';

// Under Test.
import job from '../src/job';

const resolveAfter = (time : number, result : any = null) => new Promise(resolve =>
  setTimeout(() => resolve(result), time),
);
const rejectAfter = (time : number, error : any) => new Promise((resolve, reject) => {
  setTimeout(() => reject(error || new Error('poop')), time);
});
const validOptions = { work: () => resolveAfter(1) };
const workTime = 10; // ms
const Foo = () => <div>Foo</div>;

describe('job()', () => {
  warningsAsErrors();

  describe('options', () => {
    it('returns a function', () => {
      const actual = typeof job({ work: () => undefined });
      const expected = 'function';
      expect(actual).toEqual(expected);
    });

    it('should throw if no options are provided', () => {
      // $FlowIgnore: we expect this to flow error
      expect(() => job()).toThrowError(/must provide an options object/);
    });

    it('should throw if invalid type provided as options', () => {
      // $FlowIgnore: we expect this to flow error
      expect(() => job(1)).toThrowError(/must provide an options object/);
    });

    it('should throws if no work is provided', () => {
      // $FlowIgnore: we expect this to flow error
      expect(() => job({})).toThrowError(/must provide a work function/);
    });

    it('should throws if the work is invalid', () => {
      // $FlowIgnore: we expect this to flow error
      expect(() => job({ work: 1 })).toThrowError(/must provide a work function/);
    });
  });

  describe('higher order component', () => {
    const hoc = job(validOptions);
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
    it('throws if the work does not return a promise', () => {
      const InvalidFooWithJob = job({ work: () => () => undefined })(Foo);
      expect(() => shallow(<InvalidFooWithJob />))
        .toThrowError(/work\(props\) should return a Promise/);
    });

    it('should set "loading" when processing work', () => {
      const FooWithJob = job({ work: () => resolveAfter(workTime) })(Foo);
      const actual = shallow(<FooWithJob />).find(Foo).props();
      const expected = { job: { loading: true, result: undefined, error: undefined } };
      expect(actual).toMatchObject(expected);
    });

    it('should set "result" when work completes successfully', () => {
      const FooWithJob = job({ work: () => resolveAfter(workTime, 'result') })(Foo);
      const renderWrapper = mount(<FooWithJob />);
      // Allow enough time for work to complete
      return resolveAfter(workTime + 5).then(() => {
        const actual = renderWrapper.find(Foo).props();
        const expected = { job: { loading: false, result: 'result', error: undefined } };
        expect(actual).toMatchObject(expected);
      });
    });

    it('should set "error" when work fails', () => {
      const FooWithJob = job({ work: () => rejectAfter(workTime, 'error') })(Foo);
      const renderWrapper = mount(<FooWithJob />);
      // Allow enough time for work to complete
      return resolveAfter(workTime + 5).then(() => {
        const actual = renderWrapper.find(Foo).props();
        const expected = { job: { loading: false, result: undefined, error: 'error' } };
        expect(actual).toMatchObject(expected);
      });
    });
  });
});
