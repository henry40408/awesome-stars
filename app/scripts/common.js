import format from 'date-fns/format'

function currentTimestamp () {
  return format(new Date(), 'YYYY-MM-DDTHH:mm:ssZ')
}

export function log (...args) {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(currentTimestamp(), ...args)
  }
}

export function logError (...args) {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.error(currentTimestamp(), '❌', ...args)
  }
}
