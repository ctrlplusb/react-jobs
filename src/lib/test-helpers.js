import React from 'react'

export function Foo({ job: { inProgress, result, error } }) {
  if (inProgress) return <div>In progress...</div>
  if (error) return <div>Error: {error.toString()}</div>
  return <div>{result}</div>
}

export const resolveAfter = (time, result = null) =>
  new Promise(resolve => setTimeout(() => resolve(result), time))

export const rejectAfter = (time, error) =>
  new Promise((resolve, reject) => {
    setTimeout(() => reject(error || new Error('poop')), time)
  })

export function warningsToErrors() {
  // Ensure console.warnings become thrown errors.
  beforeEach(() => {
    global.console.warn = jest.fn(msg => {
      throw new Error(msg)
    })
  })
}
