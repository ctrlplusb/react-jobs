/* @flow */

import React, { Children, Element } from 'react';
import { isPromise } from '../utils';
import ServerProvider from './ServerProvider';
import createRunJobsExecContext from './createRunJobsExecContext';
import { STATE_IDENTIFIER } from './constants';
import type { RehydrateState } from './types';

type React$Element = Element<*>;
type Context = { [key: string]: any; };
type ElementVisitor =
  (element: React$Element, instance: ?Function, context: Context) => boolean | void;
type ElementJob = {
  job: Promise<any>,
  element: React$Element,
  context: Context,
}
type RunJobsResult = {
  app: React$Element,
  state: RehydrateState,
  STATE_IDENTIFIER: string,
};

// Recurse an React Element tree, running visitor on each element.
// If visitor returns `false`, don't call the element's render function
//   or recurse into its child elements
export function walkTree(
  element: React$Element,
  context: Context,
  visitor: ElementVisitor,
) {
  const Component = element.type;

  // a stateless functional component or a class
  if (typeof Component === 'function') {
    const props = Object.assign({}, Component.defaultProps, element.props);
    let childContext = context;
    let child;

    // Are we are a react class?
    // http://bit.ly/2j9Ifk3
    const isReactClassComponent = Component.prototype &&
      (Component.prototype.isReactComponent || Component.prototype.isPureReactComponent);

    if (isReactClassComponent) {
      const instance = new Component(props, context);
      // In case the user doesn't pass these to super in the constructor
      instance.props = instance.props || props;
      instance.context = instance.context || context;

      // Override setState to just change the state, not queue up an update.
      //   (we can't do the default React thing as we aren't mounted "properly"
      //   however, we don't need to re-render as well only support setState in
      //   componentWillMount, which happens *before* render).
      instance.setState = (newState) => {
        instance.state = Object.assign({}, instance.state, newState);
      };

      if (instance.componentWillMount) {
        instance.componentWillMount();
      }

      if (instance.getChildContext) {
        childContext = Object.assign({}, context, instance.getChildContext());
      }

      if (visitor(element, instance, context) === false) {
        return;
      }

      child = instance.render();
    } else { // just a stateless functional
      if (visitor(element, null, context) === false) {
        return;
      }

      child = Component(props, context);
    }

    if (child) {
      walkTree(child, childContext, visitor);
    }
  } else { // a basic string or dom element, just get children
    if (visitor(element, null, context) === false) {
      return;
    }

    if (element.props && element.props.children) {
      Children.forEach(element.props.children, (child: any) => {
        if (child) {
          walkTree(child, context, visitor);
        }
      });
    }
  }
}

function getJobs(
  rootElement : React$Element,
  rootContext : Object,
  fetchRoot : boolean = true,
) : ElementJob[] {
  const jobs = [];

  walkTree(rootElement, rootContext, (element, instance, context) => {
    const skipRoot = !fetchRoot && (element === rootElement);
    if (instance && typeof instance.getExecutingJob === 'function' && !skipRoot) {
      const job = instance.getExecutingJob();
      if (isPromise(job)) {
        jobs.push({ job, element, context });

        // Tell walkTree to not recurse inside this component;  we will
        // wait for the query to execute before attempting it.
        return false;
      }
    }

    return undefined;
  });

  return jobs;
}

export default function runJobs(
  rootElement : Element<any>,
  rootContext : Object = {},
  isRoot : boolean = true,
) : Promise<RunJobsResult> {
  let processingElement;
  if (isRoot) {
    const runJobsExecContext = createRunJobsExecContext();
    rootContext.runJobsExecContext = runJobsExecContext; // eslint-disable-line no-param-reassign
    processingElement = (
      <ServerProvider runJobsExecContext={runJobsExecContext}>
        {rootElement}
      </ServerProvider>
    );
  } else {
    processingElement = rootElement;
  }

  const resolveResult = () => ({
    app: processingElement,
    state: rootContext.runJobsExecContext.getState(),
    STATE_IDENTIFIER,
  });

  const jobs = getJobs(processingElement, rootContext, isRoot);

  // No jobs found, nothing to do.
  if (!jobs.length) {
    return Promise.resolve(resolveResult());
  }

  // Wait on each job that we found, re-rendering the subtree when they are done.
  const mappedJobs = jobs.map(({ job, element, context }) =>
    job.then(() => runJobs(
      element,
      context,
      // We've just grabbed the job for element so don't try and get it again
      false,
    )),
  );

  return Promise.all(mappedJobs)
    // Swallow errors.
    .catch(() => undefined)
    .then(() => resolveResult());
}
