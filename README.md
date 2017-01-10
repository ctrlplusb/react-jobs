# react-jobs 🕴

Attach asynchronous/synchronous "jobs" to your components, with SSR support.

[![npm](https://img.shields.io/npm/v/react-jobs.svg?style=flat-square)](http://npm.im/react-jobs)
[![MIT License](https://img.shields.io/npm/l/react-jobs.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Travis](https://img.shields.io/travis/ctrlplusb/react-jobs.svg?style=flat-square)](https://travis-ci.org/ctrlplusb/react-jobs)
[![Codecov](https://img.shields.io/codecov/c/github/ctrlplusb/react-jobs.svg?style=flat-square)](https://codecov.io/github/ctrlplusb/react-jobs)

```js
export default withJob(
  () => ({ categoryID }) => fetch(`/categories/${categoryID}`).then(r => r.json())
)(Category)
```

## TOCs

  - [Introduction](#introduction)
  - [Features](#features)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Server Side Rendering Usage](#server-side-rendering-usage)
  - [API](#api)
    - [withJob(createWork)](#withjobcreatework)
    - [runJobs(app)](#runjobsapp)
    - [rehydrateJobs(app)](#rehydratejobsapp)
  - [Alternatives](#alternatives)
  - [Recipes](#recipes)
    - [`redux-thunk`](#redux-thunk)
  - [FAQs](#faqs)
  - [Changelog](https://github.com/ctrlplusb/react-jobs/releases)
  - [Credits](#credits)

## Introduction

This library provides you with a generic mechanism of attaching "jobs" to your React Components, and includes support for server rendering (i.e. within SSR/universal/isomorphic) apps.

## Features

 - Resolve additional data/props for your components in a asynchronous or synchronous manner.
 - Fire a generic piece of "work" any time your component is mounted.
 - Simple `function` and `Promise` based API which allows you to easily compose additional features such as caching or 3rd party integrations (e.g. Redux).
 - Doesn't block your component from rendering when running asynchronous jobs. Instead it passes a "job" prop to your component that represents the state of a job.  This allows you to show a "loading" component if you like, or continue rendering subtrees whilst the data loads. It's additionally trivial to cache asynchronous results to avoid your "loading" component flashing in/out of the DOM when a job has previously executed.
 - Separate data loading concerns from your components to ease testing.
 - Support for SSR applications with:
    - data preloading on the server.
    - "job" deferring (i.e. insist that job only gets executed on the client/browser).
    - rehydration API for the browser/client to prevent React checksum issues.
 - Splits the browser and SSR APIs so that you don't end up including so that your project bundle will only include the parts of this library it needs depending on whether you go for a browser/SSR implementation.

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

Below we will detail how to use this library for the typical _browser_-only use.

In the naive example below we will use the `fetch` API (you'll need to [polyfill it](https://github.com/github/fetch) for older browsers) to retrieve data from an API endpoint.

```js
import React from 'react';
import { withJob } from 'react-jobs'; // 👈 import the withJob helper
import Product from './components/Product';

function Products(props) {
  const {
    job, // 👈 Wrapping your component with a "job" will result in
         //    this prop being provided to it.  This represents the
         //    state of the "job".
    categoryID,
  } = props;

  if (job.inProgress) {
    //    👆
    // If the job is still being processed (i.e. the Promise
    // is not yet resolved) then the `job.inProgress` boolean flag
    // value will be set to `true`.
    return <div>Retrieving...</div>;
  }

  if (job.error) {
    //    👆
    // If an error occurred whilst trying to execute your work
    // then the `job.error` will contain the error.
    return <div>Oh noes!</div>;
  }

  if (job.completed) {
    //    👆
    // This is especially useful if your work results in an "undefined"
    // value.  This would mean we would have the following values:
    //   inProgress : false
    //   result: undefined
    //   error: undefined
    //
    // This could mean that the work hasn't started yet (i.e initial
    // render, or it could mean the work resolved with an "undefined").
    //
    // To avoid confusion we add this extra flag.
    //   completed: true|false
    //   
    // When this is true then the work has executed and completed,
    // with a success/failure.  When it is false then the work
    // may still be in progress or has yet to be executed.
    //
    // Thanks to @smirea for recommending/spotting this! 🙏
  }

  // Yay! We have the results!
  return (
    <div>
      {
        //      This will contain the result of the "job".
        //      In this example we expect an array of
        //   👇 products to be returned.
        job.result.map(product =>
          <Product key={product.id} item={product} />
        )}
    </div>
  );
}

// You use the "withJob" function to attach work to your component.
//             👇
export default withJob(
  // Provide a function that will create a "work" function.
  // The "work" function will be provided the props that were
  // passed into component and must return a Promise for
  // asynchronous work, and any other value for synchronous
  // work.
  function createWork() {
    return function work(props) {
      // Fetch the products for the given `categoryID` prop,
      return fetch(`/products/category/${props.categoryID}`)
        // then convert the response to JSON.
        .then(response => response.json());
    }
  }
)(Products);
```

This component can then be used like so:

```jsx
<Products categoryID={1} />
```

## Server Side Rendering Usage

Below we will detail how to use this library for a _server side rendering_ application.

We have created a `/ssr` import point so that the server side rendering related modules of this library will only be bundled into your project when used.  This saves the "browser-only" implementations some precious bytes

__Shared Code__

Let's say you had the following React application component you want to render on the server/client:

```jsx
import React from 'react';
import { withJob } from 'react-jobs/ssr'; // 👈 ❗️ note the "/ssr"

function MyApp({ job }) {
  if (job.result) {
    return <div>{job.result}</div>;
  }
  return null;
}

// Use the job the same in a similar fashion to the
// "browser-only" implementation.
//             👇
export default withJob(
  function createWork() {
    return function work(props) {
      return fetch('/stuff').then(r => r.json());
    }
  }
)(MyApp);
```

__Server__

When rendering on the server do the following...

```js
import { runJobs } from 'react-jobs/ssr'; // 👈
import React from 'react';
import { renderToString } from 'react-dom/server';
import serialize from 'serialize-javascript';
import MyApp from './shared/components/MyApp';

export default function expressMiddleware(req, res, next) {
  const app = <MyApp />;

  // 👇 run the jobs on your app.
  runJobs(app)
    //        👇 and you get back a result object.
    .then((runResult) => {
      const {
        // ❗️ The runResult includes a decorated version of your app
        // that will have all the jobs data on it. Make sure you us
        // this for the renderToString call.
        appWithJobs,
        // This state object represents the job state for the
        // render. You need to attach this to the response
        // so that the client app can rehydrate itself with
        // this data.
        state,
        // This is the identifier you should use when attaching
        // the state to the "window" object.
        STATE_IDENTIFIER
      } = runResult;

      const appString = renderToString(appWithJobs);
      const html = `
        <html>
          <head>
            <title>Example</title>
          </head>
          <body>
            <div id="app">${appString}</div>
            <script type="text/javascript">
              window.${STATE_IDENTIFIER} = ${serialize(state)}
            </script>
          </body>
        </html>`;
      res.send(html);
    });
}
```

__Client__

When rendering on the client/browser do the following...

```js
import React from 'react';
import { render } from 'react-dom';
import { rehydrateJobs } from 'react-jobs/ssr'; // 👈
import MyApp from './shared/components/MyApp';

const app = <MyApp />;

//    Provide your app component to the rehydrateJobs function
//    so that the job data from the server is restored into your
//    the browser render of your app. This will make sure the
//    React checksums match with the response from the server
// 👇 and will prevent any "double" rendering of your app.
rehydrateJobs(app)
  //       👇 and you get back a result object.
  .then((rehydrateResult) => {
    const {
      // ❗️ The rehydrateResult includes a decorated version of
      // your app that will have all the jobs data on it. Make
      // sure you us this for the render call.
      appWithJobs,
    } = runResult;

    render(appWithJobs, document.getElementById('app'));
  });
```

## API

### `withJob(createWork)`

Attaches a "job", which defines some asynchronous/synchronous work that should be done, to a React component.

It does not modify the component class passed to it; instead, it returns a new component class for you to use.

The new component class will receive an additional prop called `job`.  The `job` prop is an object with the following properties:

  - `inProgress` _(Boolean)_: For an asynchronous job this will indicate if the job is currently in progress. If the asynchronous job is complete then it will have a value of `false`. It will always have a value of `false` for synchronous jobs.
  - `completed` _(Boolean)_: It is initially set to `false`. After the job completes (with either a success or a failure), it will be set to `true`. Useful to check if your job might return an `undefined` value.
  - [`result`] _(Any)_: This property will only be defined for a successful execution of synchronous job or when an asynchronous job has completed successfully.  It will contain the value returned/resolved from the synchronous/asynchronous job.
  - [`error`] _(Error)_: If an error occurred whilst executing the job then this property will be defined and will contain the error.

#### Importing

There are two versions of this API. One for "browser-only" applications, and another for "server side rendering" applications.

For a "browser-only" React application use the following import:
```js
import { withJob } from 'react-jobs';
```

For a "server side rendering" React application use the following import:
```js
import { withJob } from 'react-jobs/ssr';
```

#### Arguments

 - `createWork() : work` _(Function)_: A function that when executed must return a `work` function. We use this technique so that the "work" for a job can be created/executed lazily. The `work` function that you must return can be described as follows:
   - `work(props) : Promise<Result>|Result` _(Function)_: The work function contains the actual work that needs to be done for a job. It will be provided the props that are given to your component. For asynchronous work it must return a `Promise` that will resolve to the result of the work. For any other return value (including `undefined`) the work will be considered synchronous.
- `[options]` _(Object)_: A configuration object for the job. At the moment only the SSR version of `job` uses options. The options object has the following properties:
   - `[defer]` _(Boolean)_: Defaults to `false`. Indicates whether a server side execution of this job should defer execution of the job to the browser/client.

#### Returns

A higher-order React component class that passes the job state into your component derived from the supplied arguments.

#### Examples

##### Asynchronous Job

```js
export default withJob(
  () => (props) => new Promise('/fetchSomething')
)(YourComponent);
```

##### Synchronous Job

```js
export default withJob(
  () => (props) => 'foo'
)(YourComponent);
```

##### Defer Job on Server

```js
export default withJob(
  () => (props) => new Promise('/fetchSomething'),
  { defer: true }
)(YourComponent);
```

##### Simple Caching of Asynchronous Job

```js
let resultCache = null;

export default withJob(
  () => (props) => {
    if (resultCache) {
      // We have a cached result, return it.
      // This becomes a synchronous job result, which is also
      // handy when you display a "loading" component as the
      // "loading" component will not flash in/out.
      return resultCache;
    }
    return new Promise('/fetchSomething')
      .then((result) => {
        resultCache = result;
        return result;
      });
  }
)(YourComponent);
```

### `runJobs(app)`

This is used to run jobs on the "server" side of your "server side rendering" React application.

#### Importing

```js
import { runJobs } from 'react-jobs/ssr';
```

#### Arguments

  - `app` _(React Element)_: Your React application element that contains components with jobs within it.

#### Returns

It returns a `Promise` that resolves an object as the result. The object contains the following properties:

  - `appWithJobs` _(React Element)_: Your React application now wrapped with everything it needs to render the components with jobs attached to them.  You _must_ pass this to the `ReactDOM.renderToString` function rather than the original "app" argument otherwise your job components won't render with the job results resolved on the server.
  - `state` _(Object)_: This represents the state of the jobs that were run for this execution of `runJobs`.  You need to serialize this state and provide it back to the browser so that the client can rehydrate properly.
  - `STATE_IDENTIFIER` _(String)_: The identifier you must use when serializing the `state` against the `window` object for the client response.

#### Example

```js
const app = <MyApp />;
runJobs(app).then(({ appWithJobs, state, STATE_IDENTIFIER }) => {
  const appString = ReactDOM.renderToString(appWithJobs);
  const html = `
        <html>
          <head>
            <title>Example</title>
          </head>
          <body>
            <div id="app">${appString}</div>
            <script type="text/javascript">
              window.${STATE_IDENTIFIER} = ${serialize(state)}
            </script>
          </body>
        </html>`;

  // Send back the HTTP response containing the HTML...
});
```

### `rehydrateJobs(app)`

This is used to rehydrate jobs on the "browser" side of your "server side rendering" React application.

#### Importing

```js
import { rehydrateJobs } from 'react-jobs/ssr';
```

#### Arguments

  - `app` _(React Element)_: Your React application element that contains components with jobs within it.

#### Returns

It returns a `Promise` that resolves an object as the result. The object contains the following properties:

  - `appWithJobs` _(React Element)_: Your React application now wrapped with everything it needs to render the components with jobs attached to them.  You _must_ pass this to the `ReactDOM.render` function rather than the original "app" argument otherwise your job components won't render with the jobs rehydrated to match the server response, which will result in the React checksums not matching and cause your app to be rendered again on the client.

#### Example

```js
const app = <MyApp />;
rehydrateJobs(app).then(({ appWithJobs }) => {
  ReactDOM.render(
    appWithJobs,
    document.getElementById('app')
  );
});
```

## Alternatives

Yes, I am aware there is a wide array of alternatives available. There are however some sublte/huge differences between this library and the rest.

Below is a list of the alternatives along with a brief description of the differences between this library and each of them.  It's good to make yourselve familiar with all of them.  Perhaps one of them will be a better fit for your specific needs.

### [`async-props`](https://github.com/ryanflorence/async-props)

TODO

### [`ground-control`](https://github.com/raisemarketplace/ground-control)

TODO

### [`react-refetch`](https://github.com/heroku/react-refetch)

TODO

### [`react-resolver`](https://github.com/ericclemmons/react-resolver)

TODO

### [`react-transmit`](https://github.com/RickWong/react-transmit)

TODO

### [`redial`](https://github.com/markdalgleish/redial)

TODO

## Recipes

### `redux-thunk`

TODO

## FAQs

> As and when they arrive...

## Credits

Inspiration has been taken from the following amazing projects:

  - [All of the projects in the "Alternatives" section](#alternatives)
  - [`react-apollo`](https://github.com/apollostack/react-apollo)
