/* eslint-disable no-restricted-syntax, no-await-in-loop */

import React from 'react'
import ReactDOM from 'react-dom'

import { Client } from 'chomex'
import chunkize from 'lodash/chunk'
import find from 'lodash/find'
import ParseGithubURL from 'parse-github-url'

import { log } from './common'
import UpdateNotification from './components/UpdateNotification'
import StarHOC from './components/StarHOC'

const CHUNK_SIZE = 10
const GITHUB_ISSUES_URL_PATTERN = /https:\/\/github\.com\/(.+?)\/issues\/(\d+)/
const GITHUB_ISSUES_LINKS_LIMIT = 1000

let messageClient = new Client(chrome.runtime)

function parseGithubURL (url) {
  let parsed = ParseGithubURL(url)
  if (parsed && parsed.host === 'github.com' && parsed.owner && parsed.name) {
    let { host, owner, name } = parsed
    return { valid: true, host, owner, name }
  }
  return { valid: false }
}

function appendStars (tuples) {
  /** @type {[StarHOC]} */
  let stars = []

  for (let tuple of tuples) {
    let { link, owner, name } = tuple
    let starNode = document.createElement('span')
    link.parentNode.insertBefore(starNode, link.nextSibling)
    ReactDOM.render(<StarHOC ref={star => stars.push(star)} owner={owner} name={name} />, starNode)
  }

  return stars
}

async function batchUpdateCountAsync (stars) {
  let chunks = chunkize(stars, CHUNK_SIZE)

  for (let chunk of chunks) {
    let tuples = chunk.map(star => star.getTuple())
    let { data: tuplesWithStar } = await messageClient.message('/stars/get/batch', { tuples })

    for (let star of chunk) {
      let tuple = find(tuplesWithStar, star.getTuple())
      star.updateCount(tuple.star)
    }

    await messageClient.message('/rate-limit')
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
  let { data: isAwesomeList } = await messageClient.message('/awesome-list/check', { owner, name })

  if (isAwesomeList) {
    log(`awesome list ${owner}/${name} detected`)
    return true
  }

  return false
}

async function attachStarsOnLinksAsync (links) {
  let tuples = links
    .filter(link => !link.hash)
    .map((link) => {
      let { valid, owner, name } = parseGithubURL(link.href)
      return { valid, link, owner, name }
    })
    .filter(tuple => tuple.valid)

  let stars = appendStars(tuples)
  await batchUpdateCountAsync(stars)
}

async function initForReadmeAsync () {
  let isAwesomeList = await isAwesomeListAsync()
  if (!isAwesomeList) {
    return
  }

  /** @type {Array} */
  let links = [].slice.call(document.querySelectorAll('#readme li > a'))
  await attachStarsOnLinksAsync(links)
}

async function initForGithubIssuesAsync () {
  let { data: applyOnGithubIssues } = await messageClient.message('/apply-on-github-issues/get')
  if (!applyOnGithubIssues) {
    return
  }

  let isGithubIssues = !!window.location.href.match(GITHUB_ISSUES_URL_PATTERN)
  if (!isGithubIssues) {
    return
  }

  let links = [].slice.call(document.querySelectorAll('.comment-body a'))
  let limitedLinks = links.slice(0, GITHUB_ISSUES_LINKS_LIMIT)
  await attachStarsOnLinksAsync(limitedLinks)
}

async function initAwesomeStarsAsync () {
  await Promise.all([
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
  let { data: updateNotificationSent } = await messageClient.message(
    '/update-notification-sent/get'
  )

  if (!updateNotificationSent) {
    showUpdateNotification()
    messageClient.message('/update-notification-sent/set', {
      updateNotificationSent: true
    })
  }
}

checkUpdateNotificationSentAsync()
initAwesomeStarsAsync()
