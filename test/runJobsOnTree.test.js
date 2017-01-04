/* @flow */

// Under test.
import runJobsOnTree from '../src/runJobsOnTree';

describe('runJobsOnTree()', () => {
  it('should return a Promise', () => {
    const actual = runJobsOnTree();
    expect(actual.then).toBeTruthy();
  });
});
