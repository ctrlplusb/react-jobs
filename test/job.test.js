import React from 'react';
import { shallow, mount } from 'enzyme';
import job from '../src/job';

const resolveAfter = (time : number, props : Object = {}) => new Promise(resolve =>
  setTimeout(() => resolve(props), time),
);
const rejectAfter = (time : number, error : any) => new Promise((resolve, reject) => {
  setTimeout(() => reject(error || new Error('poop')), time);
});
const validOptions = { work: () => resolveAfter(1) };
const workTime = 10; // ms
const Foo = () => <div>Foo</div>;
const OnError = () => <div>Oh no!</div>;
const OnWorking = () => <div>Busy...</div>;

describe('job()', () => {
  describe('options', () => {
    it('returns a function', () => {
      const actual = typeof job({ work: () => undefined });
      const expected = 'function';
      expect(actual).toEqual(expected);
    });

    it('should throw if no options are provided', () => {
      expect(() => job()).toThrowError(/must provide an options object/);
    });

    it('should throw if invalid type provided as options', () => {
      expect(() => job(1)).toThrowError(/must provide an options object/);
    });

    it('should throws if no work is provided', () => {
      expect(() => job({})).toThrowError(/must provide a work function/);
    });

    it('should throws if the work is invalid', () => {
      expect(() => job({ work: 1 })).toThrowError(/must provide a work function/);
    });
  });

  describe('higher order component', () => {
    const hoc = job(validOptions);
    const actual = hoc(Foo);

    it('should return a "class" component', () => {
      expect(typeof actual).toEqual('function');
      // https://github.com/facebook/react/blob/master/src/renderers/shared/stack/reconciler/ReactCompositeComponent.js#L66
      expect(actual.prototype).toBeDefined();
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

    it('should render the wrapped component when the work is complete', () => {
      const FooWithJob = job({ work: () => resolveAfter(workTime) })(Foo);
      // Initial render (i.e. kicks off work)
      const renderWrapper = mount(<FooWithJob />);
      expect(renderWrapper).toMatchSnapshot();
      // Allow enough time for work to complete, then the wrapped component should
      // be rendered with the provided props.
      return resolveAfter(workTime + 5).then(() => {
        expect(renderWrapper).toMatchSnapshot();
      });
    });

    it('should render the default error component', () => {
      const FooWithJob = job({ work: () => rejectAfter(1) })(Foo);
      const renderWrapper = mount(<FooWithJob />);
      return resolveAfter(2).then(() => {
        expect(renderWrapper).toMatchSnapshot();
      });
    });

    it('should render the OnError component', () => {
      const FooWithJob = job({ work: () => rejectAfter(1), OnError })(Foo);
      const renderWrapper = mount(<FooWithJob bar="baz" />);
      return resolveAfter(2).then(() => {
        expect(renderWrapper).toMatchSnapshot();
      });
    });

    it('should render the OnWorking component', () => {
      const FooWithJob = job({ work: () => resolveAfter(workTime), OnWorking })(Foo);
      const renderWrapper = mount(<FooWithJob bar="baz" />);
      expect(renderWrapper).toMatchSnapshot();
    });
  });
});
