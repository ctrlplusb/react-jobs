/* @flow */

// eslint-disable-next-line import/no-extraneous-dependencies
import React, { Element } from 'react'
// eslint-disable-next-line import/no-extraneous-dependencies
import reactTreeWalker from 'react-tree-walker'
import { isPromise } from '../utils'
import ServerProvider from './ServerProvider'
import createRunJobsExecContext from './createRunJobsExecContext'
import { STATE_IDENTIFIER } from './constants'
import type { RehydrateState } from './types'

type React$Element = Element<*>;
type Context = { [key: string]: any };
type ElementJob = {
  job: Promise<any>,
  element: React$Element,
  context: Context,
};
type RunJobsResult = {
  appWithJobs: React$Element,
  state: RehydrateState,
  STATE_IDENTIFIER: string,
};

function getJobs(
  rootElement: React$Element,
  rootContext: Object,
  fetchRoot: boolean = true,
): ElementJob[] {
  const jobs = []

  reactTreeWalker(
    rootElement,
    (element, instance, context) => {
      const skipRoot = !fetchRoot && element === rootElement
      if (
        instance && typeof instance.getExecutingJob === 'function' && !skipRoot
      ) {
        const job = instance.getExecutingJob()
        if (isPromise(job)) {
          jobs.push({ job, element: instance, context })

          // Tell walkTree to not recurse inside this component;  we will
          // wait for the query to execute before attempting it.
          return false
        }
      }

      return undefined
    },
    rootContext,
  )

  return jobs
}

export default function runJobs(
  rootElement: Element<any>,
  rootContext: Object = {},
  isRoot: boolean = true,
): Promise<RunJobsResult> {
  let processingElement
  if (isRoot) {
    const runJobsExecContext = createRunJobsExecContext()
    rootContext.runJobsExecContext = runJobsExecContext // eslint-disable-line no-param-reassign
    processingElement = (
      <ServerProvider runJobsExecContext={runJobsExecContext}>
        {rootElement}
      </ServerProvider>
    )
  } else {
    processingElement = rootElement
  }

  const resolveResult = () => ({
    appWithJobs: processingElement,
    state: rootContext.runJobsExecContext.getState(),
    STATE_IDENTIFIER,
  })

  const runningJobs = getJobs(processingElement, rootContext, isRoot)
    // Map over the jobs and then...
    .map(({ job, element, context }) =>
      // ... make sure they will continue executing jobs for their Children
      // when they are complete.
      job.then(() =>
        runJobs(
          element,
          context,
          // We've just grabbed the job for element so don't try and get it again
          false,
        )))

  return runningJobs.length > 0
    ? Promise.all(runningJobs)
        // Swallow errors.
        .catch(() => undefined)
        .then(() => resolveResult())
    : Promise.resolve(resolveResult())
}
