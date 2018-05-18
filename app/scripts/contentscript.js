/* eslint-disable no-restricted-syntax, no-await-in-loop */

import React from 'react'
import ReactDOM from 'react-dom'

import { Client } from 'chomex'
import chunkize from 'lodash/chunk'
import find from 'lodash/find'
import ParseGithubURL from 'parse-github-url'

import { log, logError } from './common'

import UpdateNotification from './components/UpdateNotification'
import StarHOC from './components/StarHOC'

const CHUNK_SIZE = 50
const GITHUB_ISSUES_URL_PATTERN = /https:\/\/github\.com\/(.+?)\/issues\/(\d+)/
const GITHUB_ISSUES_LINKS_LIMIT = 1000

let messageClient = new Client(chrome.runtime)

function parseGithubURL (url) {
  let parsed = ParseGithubURL(url)
  if (parsed && parsed.host === 'github.com' && parsed.owner && parsed.name) {
    let { owner, name } = parsed
    return { valid: true, owner, name }
  }
  return { valid: false }
}

function appendStars (tuples) {
  /** @type {Array<StarHOC>} */
  let stars = []

  for (let tuple of tuples) {
    let { link, owner, name } = tuple
    let starNode = document.createElement('span')

    link.parentNode.insertBefore(starNode, link.nextSibling)

    ReactDOM.render(<StarHOC
      ref={star => stars.push(star)}
      owner={owner} name={name}
    />, starNode)
  }

  return stars
}

async function batchUpdateChunkAsync (chunk) {
  let tuples = chunk.map(star => star.tuple)

  let { data: tuplesWithStar } = await messageClient.message('/stars/get/batch', { tuples })

  for (let star of chunk) {
    let tuple = find(tuplesWithStar, star.tuple)
    if (tuple.error) {
      star.updateError(true)
    } else {
      star.updateCount(tuple.star)
    }
  }
}

async function batchUpdateStarsAsync (stars) {
  let chunks = chunkize(stars, CHUNK_SIZE)

  for (let chunk of chunks) {
    try {
      await batchUpdateChunkAsync(chunk)
      await messageClient.message('/rate-limit')
    } catch (error) {
      logError(error)
      for (let star of chunk) {
        star.updateError(true)
      }
    }
  }
}

async function isAwesomeListAsync () {
  let parsed = parseGithubURL(window.location.href)
  if (!parsed) {
    return false
  }

  let readme = document.querySelector('#readme')
  if (!readme) {
    return false
  }

  let { owner, name } = parsed

  try {
    let { data: isAwesomeList } = await messageClient.message('/awesome-list/check', { owner, name })

    if (isAwesomeList) {
      log(`🚨 awesome list ${owner}/${name} detected`)
      return true
    }

    return false
  } catch (error) {
    logError(error)
  }
}

async function attachStarsOnLinksAsync (links) {
  let tuples = links
    .filter(link => !link.hash) // filter out anchors: such as <a href="#foobar" />
    .map(link => ({ link, ...parseGithubURL(link.href) }))
    .filter(tuple => tuple.valid)

  let stars = appendStars(tuples)
  await batchUpdateStarsAsync(stars)
}

async function initForReadmeAsync () {
  let isAwesomeList = await isAwesomeListAsync()
  if (!isAwesomeList) {
    return
  }

  /** @type {Array<HTMLElement>} */
  let links = [].slice.call(document.querySelectorAll('#readme li > a'))
  await attachStarsOnLinksAsync(links)
}

async function initForGithubIssuesAsync () {
  try {
    let { data: applyOnGithubIssues } = await messageClient.message('/apply-on-github-issues/get')
    if (!applyOnGithubIssues) {
      return
    }

    let isGithubIssues = !!window.location.href.match(GITHUB_ISSUES_URL_PATTERN)
    if (!isGithubIssues) {
      return
    }

    /** @type {Array<HTMLElement>} */
    let links = [].slice.call(document.querySelectorAll('.comment-body a'))

    let limitedLinks = links.slice(0, GITHUB_ISSUES_LINKS_LIMIT)
    await attachStarsOnLinksAsync(limitedLinks)
  } catch (error) {
    logError(error)
  }
}

async function initAwesomeStarsAsync () {
  return Promise.all([
    initForReadmeAsync(),
    initForGithubIssuesAsync()
  ])
}

function showUpdateNotification () {
  let $emptyContainer = document.createElement('div')
  let $jsFlashContainer = document.getElementById('js-flash-container')
  $jsFlashContainer.appendChild($emptyContainer)
  ReactDOM.render(<UpdateNotification />, $emptyContainer)
}

async function checkUpdateNotificationSentAsync () {
  try {
    let { data: updateNotificationSent } = await messageClient.message(
      '/update-notification-sent/get'
    )

    if (!updateNotificationSent) {
      showUpdateNotification()
      messageClient.message('/update-notification-sent/set', {
        updateNotificationSent: true
      })
    }
  } catch (error) {
    logError(error)
  }
}

checkUpdateNotificationSentAsync()
initAwesomeStarsAsync()
