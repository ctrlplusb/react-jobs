# react-jobs 🕴

Attach asynchronous work to your components, with SSR support.

[![npm](https://img.shields.io/npm/v/react-jobs.svg?style=flat-square)](http://npm.im/react-jobs)
[![MIT License](https://img.shields.io/npm/l/react-jobs.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Travis](https://img.shields.io/travis/ctrlplusb/react-jobs.svg?style=flat-square)](https://travis-ci.org/ctrlplusb/react-jobs)
[![Codecov](https://img.shields.io/codecov/c/github/ctrlplusb/react-jobs.svg?style=flat-square)](https://codecov.io/github/ctrlplusb/react-jobs)

## TOCs

  - [Introduction](#introduction)
  - [Examples](#examples)
    - [Simple](#simple-example)
    - [Redux](#redux-example)
  - [API](#api)
    - [job](#job)
  - [FAQs](#faqs)

## Introduction

This library takes heavy inspiration from the amazing [`react-apollo`](https://github.com/apollostack/react-apollo) library to provide you with a generic mechanism of attaching `Promise`-based work, which can provide asynchronous prop resolution, to your React Components.

## Examples

### Simple Example

In the example below we will use the `fetch` API (you'll need to [polyfill it](https://github.com/github/fetch) for older browsers) to retrieve data from an API endpoint.

```js
import React from 'react';
import { job } from 'react-jobs';
import Product from './components/Product';

function Products({ job, categoryID }) {
  // We provide a "job" prop containing the status/results of
  // the work you attached to your component.

  if (job.loading) {
    // If the work is still being processed (i.e. the Promise
    // is not yet resolved) then the `job.loading` boolean flag
    // value will be set to `true`.
    return <div>Retrieving...</div>;
  }
  if (job.error) {
    // If an error occurred whilst trying to execute your work
    // then the `job.error` will contain the error.
    return <div>Oh noes!</div>;
  }
  // Yay! We have the results!
  return (
    <div>
      {
        job.results.map(product =>
          <Product key={product.id} item={product} />
        )}
    </div>
  );
}

export default job({
  // Define the work function, which accepts the props provided to
  // your component and must return a Promise which resolves with
  // the results.
  work: (props) =>
    // Fetch the products for the given `categoryID` prop,
    fetch(`/products/category/${props.categoryID}`)
    // then return the response as JSON.
    .then(response => response.json()),
})(Products);

```

### Redux Example

TODO

## API

### `jobs`

TODO

## FAQs

> Let me know your questions...
