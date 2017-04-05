> NOTE: This is an alpha release.  The previous "stable" is on the `0.x.x` branch.

# react-jobs 💼

Asynchronously resolve data for your components, with support for server side rendering.

[![npm](https://img.shields.io/npm/v/react-jobs.svg?style=flat-square)](http://npm.im/react-jobs)
[![MIT License](https://img.shields.io/npm/l/react-jobs.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Travis](https://img.shields.io/travis/ctrlplusb/react-jobs.svg?style=flat-square)](https://travis-ci.org/ctrlplusb/react-jobs)
[![Codecov](https://img.shields.io/codecov/c/github/ctrlplusb/react-jobs.svg?style=flat-square)](https://codecov.io/github/ctrlplusb/react-jobs)

```js
export default withJob({
  work: (props) => fetch(`/categories/${props.categoryID}`).then(r => r.json()),
  LoadingComponent: (props) => <div>Loading...</div>, // Optional
  ErrorComponent: ({ error }) => <div>{error.message}</div>, // Optional
})(Category)
```

## TOCs

  - [Introduction](#introduction)
  - [Features](#features)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API](#api)
  - [Server Side Rendering](#server-side-rendering)
  - [FAQs](#faqs)
  - [Changelog](https://github.com/ctrlplusb/react-jobs/releases)

## Introduction

This library provides you with a generic mechanism of attaching jobs to asynchronously resolve data for your React Components.

## Features

 - Asynchronously resolve data for your components.
 - Show a LoadingComponent whilst data is being fetched.
 - Show an ErrorComponent if data fetching fails.
 - Simple `function` and `Promise` based API which allows you to easily compose additional features such as caching or 3rd party integrations (e.g. Redux).
 - Separate data loading concerns from your components to ease testing.
 - Support for server sider rendering applications, with:
    - data preloading on the server.
    - "job" deferring (i.e. insist that job only gets resolved in the browser).
    - rehydration API for the browser/client to prevent React checksum issues.
    - provides interoperability with [`react-async-component`](https://github.com/ctrlplusb/react-async-component) for your code splitting needs.

## Installation

__npm__

```bash
npm i react-jobs -S
```

__yarn__

```bash
yarn add react-jobs
```

## Usage

In the naive example below we will use the `fetch` API (you may need to [polyfill it](https://github.com/github/fetch) for older browsers) to retrieve data from an API endpoint.

```js
import React from 'react'
import { withJob } from 'react-jobs' // 👈
import Product from './Product'

// When the work has completed your component will be rendered
// with a "jobResult" prop containing the result of the work.
//                               👇
function Products({ categoryID, jobResult }) {
  return (
    <div>
      { jobResult.map(product =>
          <Product key={product.id} product={product} />
        )}
    </div>
  )
}

// You use the "withJob" function to attach work to your component.
//             👇
export default withJob({
  work: (props) =>
    fetch(`/products/category/${props.categoryID}`)
      .then(response => response.json())
})(Products)
```

This component can then be used like so:

```jsx
<Products categoryID={1} />
```

## API

### `withJob(config)`

Attaches a "job" to a target Component.

When the job has completed successfully your component will be rendered and provided a `jobResult` prop containing the result of the job.

#### Arguments

  - `config` (_Object_) : The configuration object for the async Component. It has the following properties available:
    - `work` (_(props) => Promise<Result>|Result_): A function containing the actual work that needs to be done for a job. It will be provided the props that are given to your component. It can return a `Promise` to asynchronously resolve the result of the job, or anything else in order to resolve synchronously.
    - `LoadingComponent` (_Component_, Optional, default: `null`) : A Component that will be displayed until the `work` is complete. All props will be passed to it.
    - `ErrorComponent` (_Component_, Optional, default: `null`) : A Component that will be displayed if any error occurred whilst trying to execute the `work`. All props will be passed to it as well as an `error` prop containing the `Error`.
    - `shouldWorkAgain` (_(prevProps, nextProps, jobStatus) => boolean_, Optional, default: `null`): A function that is executed with every `componentWillReceiveProps` lifecycle event. It receives the previous props, next props, and a `jobStatus` object. If the function returns `true` then the `work` function will be executed again, otherwise it will not. If this function is not defined, then the work will never get executed for any `componentWillReceiveProps` events. The `jobStatus` object has the following members:
      - `completed` (_Boolean_): Has the job completed execution?
      - `data` (_Any_): The result if the job succeeded, else undefined.
      - `error` (_Error_): The error if the job failed, else undefined.
    - `serverMode` (_Boolean_, Optional, default: `'resolve'`) : Only applies for server side rendering applications. Please see the documentation on server side rendering. The following values are allowed.
      - __`'resolve'`__ - The `work` will be executed on the server.
      - __`'defer'`__ - The `work` will not be executed on the server, being deferred to the browser.

#### Important notes regarding behaviour

The `work` will fires under the following conditions:

 - Any time `componentWillMount` fires. i.e. any time your component mounts. If your component is mounted and then remounted later, it _will_ execute the work again. You may want work to only be executed once, in which case I suggest you store your work result in a cache or state management system such as `redux`.  You can then check to see if the result exists in cache/state and resolve the existing value rather than perform a fetch for data.

_OR_

 - Any time the `componentWillReceiveProps` fires AND `shouldWorkAgain` returns `true`.

#### Returns

A React component.

#### Examples

##### Asynchronous

```js
export default withJob({
  work: (props) => new Promise('/fetchSomething')
})(YourComponent);
```

##### Synchronous

```js
export default withJob({
  work: (props) => 'foo'
})(YourComponent);
```

##### Using `shouldWorkAgain`

```js
export default withJob({
  work: ({ productId }) => getProduct(productId),
  shouldWorkAgain: function (prevProps, nextProps, jobStatus) {
    // We will return true any time the productId changes
    // This will allow our work to re-execute, and the
    // appropriate product data can then be fetched.
    return prevProps.productId !== nextProps.productId;
  }
})(YourComponent);
```

##### Naive Caching

```js
let resultCache = null;

export default withJob({
  work: (props) => {
    if (resultCache) {
      return resultCache;
    }
    return new Promise('/fetchSomething')
      .then((result) => {
        resultCache = result;
        return result;
      });
  }
})(YourComponent);
```

##### Retrying work that fails

You could use something like @sindresorhus's [`p-retry`](https://github.com/sindresorhus/p-retry) within your work.

```js
import pRetry from 'p-retry';

export default withJob({
  work: ({ productId }) => {
    const run = () => fetch(`https://foo.com/products/${productId}`)
      .then(response => {
        // abort retrying if the resource doesn't exist
        if (response.status === 404) {
          throw new pRetry.AbortError(response.statusText);
        }
        return response.json();
      });

    return pRetry(run, {retries: 5}).then(result => {});
  }
})(YourComponent);
```

## Server Side Rendering

This library has been designed for interoperability with [`react-async-bootstrapper`](https://github.com/ctrlplusb/react-async-bootstrapper).

`react-async-bootstrapper` allows us to do a "pre-render parse" of our React Element tree and execute an `asyncBootstrap` function that are attached to a components within the tree. In our case the "bootstrapping" process involves the resolution of our jobs prior to the render on the server. We use this 3rd party library as it allows interoperability with other libraries which also require a "bootstrapping" process (e.g. code splitting as supported by [`react-async-component`](https://github.com/ctrlplusb/react-async-component)).

Firstly, install `react-async-bootstrapper`:

```
npm install react-async-bootstrapper
```

Now, let's configure the "server" side.  You could use a similar `express` (or other HTTP server) middleware configuration:

```jsx
import React from 'react'
import { JobProvider, createJobContext } from 'react-jobs' // 👈
import asyncBootstrapper from 'react-async-bootstrapper' // 👈
import { renderToString } from 'react-dom/server'
import serialize from 'serialize-javascript'

import MyApp from './shared/components/MyApp'

export default function expressMiddleware(req, res, next) {
  //    Create the job context for our provider, this grants
  // 👇 us the ability to track the resolved jobs to send back to the client.
  const jobContext = createJobContext()

  // 👇 Ensure you wrap your application with the provider.
  const app = (
    <JobProvider asyncContext={asyncContext}>
      <MyApp />
    </JobProvider>
  )

  // 👇 This makes sure we "bootstrap" resolve any jobs prior to rendering
  asyncBootstrapper(app).then(() => {
      // We can now render our app 👇
      const appString = renderToString(app)

      // Get the resolved jobs state. 👇
      const jobsState = jobContext.getState()

      const html = `
        <html>
          <head>
            <title>Example</title>
          </head>
          <body>
            <div id="app">${appString}</div>
            <script type="text/javascript">
              // Serialise the state into the HTML response
              //                                 👇
              window.JOBS_STATE = ${serialize(jobsState)}
            </script>
          </body>
        </html>`

      res.send(html)
    });
}
```

Then on the "client" side you would do the following:

```jsx
import React from 'react'
import { render } from 'react-dom'
import { JobProvider } from 'react-jobs'

import MyApp from './shared/components/MyApp'

// Get any "rehydrate" state sent back by the server
//                               👇
const rehydrateState = window.JOBS_STATE

// Surround your app with the JobProvider, providing
// the rehydrateState
//     👇
const app = (
  <JobProvider rehydrateState={rehydrateState}>
    <MyApp />
  </JobProvider>
)

// Render 👍
render(app, document.getElementById('app'))
```

## FAQs

> Let me know if you have any questions.
