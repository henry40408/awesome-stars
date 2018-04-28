import format from 'date-fns/format'

export function log (...args) {
  if (process.env.NODE_ENV === 'development') {
    const timestamp = format(new Date(), 'YYYY-MM-DDTHH:mm:ssZ')
    // eslint-disable-next-line no-console
    console.log.apply(null, [`[${timestamp}]`, ...args])
  }
}
