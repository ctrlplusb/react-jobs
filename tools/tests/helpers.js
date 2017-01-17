/* @flow */

import React from 'react';
import sinon from 'sinon';

export function Foo({ job: { inProgress, result, error } } : Object) {
  if (inProgress) return <div>In progress...</div>;
  if (error) return <div>Error: {error.toString()}</div>;
  return <div>{result}</div>;
}

export const resolveAfter = (time : number, result : any = null) => new Promise(resolve =>
  setTimeout(() => resolve(result), time),
);

export const rejectAfter = (time : number, error : any) => new Promise((resolve, reject) => {
  setTimeout(() => reject(error || new Error('poop')), time);
});

export function warningsToErrors() {
  // Ensure console.warnings become thrown errors.
  beforeAll(() => {
    sinon.stub(console, 'error', (warning) => { throw new Error(warning); });
  });

  // While not forgetting to restore it afterwards.
  afterAll(() => { console.error.restore(); });
}
