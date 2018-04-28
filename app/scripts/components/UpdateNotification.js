import React from 'react'

import { version } from '../../../package.json'

export default () => (
  <div>
    <div className='flash flash-full flash-notice'>
      <div className='container'>
        <button
          className='flash-close js-flash-close'
          type='button'
          aria-label='Dismiss this message'
        >
          <svg
            aria-hidden='true'
            className='octicon octicon-x'
            height='16'
            version='1.1'
            viewBox='0 0 12 16'
            width='12'
          >
            <path
              fillRule='evenodd'
              d='M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48z'
            />
          </svg>
        </button>
        <strong>{'Awesome Stars'}</strong>
        {' has been updated to '}
        <strong>{version}</strong>
        {'! For more information, please check out '}
        <strong>
          <a href='https://github.com/henry40408/awesome-stars/blob/master/CHANGELOG.md'>
            {'CHANGELOG'}
          </a>
        </strong>
        {'.'}
      </div>
    </div>
  </div>
)
