/* @flow */

import { Children, Element } from 'react';
import { isPromise } from './utils';

type React$Element = Element<*>;
type Context = { [key: string]: any; };
type ElementVisitor =
  (element: React$Element, instance: ?Function, context: Context) => boolean | void;
type ElementJob = {
  job: Promise<any>,
  element: React$Element,
  context: Context,
}

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
  rootContext : Context,
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
  rootElement : React$Element,
  rootContext : Context = {},
  fetchRoot : boolean = true,
) {
  const jobs = getJobs(rootElement, rootContext, fetchRoot);

  // no queries found, nothing to do
  if (!jobs.length) {
    return Promise.resolve(null);
  }

  // wait on each query that we found, re-rendering the subtree when it's done
  const mappedJobs = jobs.map(({ job, element, context }) =>
    // we've just grabbed the query for element so don't try and get it again
    job.then(() => runJobs(element, context, false)),
  );

  return Promise.all(mappedJobs).then(() => null);
}
