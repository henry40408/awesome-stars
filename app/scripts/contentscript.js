/* eslint-disable no-restricted-syntax, no-await-in-loop */

import React from 'react'
import ReactDOM from 'react-dom'

import { Client } from 'chomex'
import chunkize from 'lodash/chunk'
import ParseGithubURL from 'parse-github-url'

import { log } from './common'
import UpdateNotification from './components/UpdateNotification'
import StarHOC from './components/StarHOC'

const CHUNK_SIZE = 10
const GITHUB_ISSUES_URL_PATTERN = /https:\/\/github\.com\/(.+?)\/issues\/(\d+)/
const GITHUB_ISSUES_LINKS_LIMIT = 1000

const messageClient = new Client(chrome.runtime)

function parseGithubURL (url) {
  const parsed = ParseGithubURL(url)
  if (parsed && parsed.host === 'github.com' && parsed.owner && parsed.name) {
    const {host, owner, name} = parsed
    return {valid: true, host, owner, name}
  }
  return {valid: false}
}

function appendStars (tuples) {
  /** @type {[StarHOC]} */
  const stars = []

  for (const tuple of tuples) {
    const {link, owner, name} = tuple
    const starNode = document.createElement('span')
    link.parentNode.insertBefore(starNode, link.nextSibling)
    ReactDOM.render(<StarHOC ref={star => stars.push(star)} owner={owner} name={name} />, starNode)
  }

  return stars
}

async function batchUpdateCountAsync (stars) {
  const chunks = chunkize(stars, CHUNK_SIZE)
  for (const chunk of chunks) {
    await Promise.all(chunk.map(star => star.updateCountAsync()))
    await messageClient.message('/rate-limit')
  }
}

async function isAwesomeListAsync () {
  const parsed = parseGithubURL(window.location.href)
  if (!parsed) {
    return false
  }

  const readme = document.querySelector('#readme')
  if (!readme) {
    return false
  }

  const {owner, name} = parsed
  const {data: isAwesomeList} = await messageClient.message('/awesome-list/check', {owner, name})

  if (isAwesomeList) {
    log(`awesome list ${owner}/${name} detected`)
    return true
  }

  return false
}

async function attachStarsOnLinksAsync (links) {
  const tuples = links
    .filter(link => !link.hash)
    .map((link) => {
      const {valid, owner, name} = parseGithubURL(link.href)
      return {valid, link, owner, name}
    })
    .filter(tuple => tuple.valid)

  const stars = appendStars(tuples)
  await batchUpdateCountAsync(stars)
}

async function initForReadmeAsync () {
  const isAwesomeList = await isAwesomeListAsync()
  if (!isAwesomeList) {
    return
  }

  /** @type {Array} */
  const links = [].slice.call(document.querySelectorAll('#readme li > a'))
  await attachStarsOnLinksAsync(links)
}

async function initForGithubIssuesAsync () {
  const {data: applyOnGithubIssues} = await messageClient.message('/apply-on-github-issues/get')
  if (!applyOnGithubIssues) {
    return
  }

  const isGithubIssues = !!window.location.href.match(GITHUB_ISSUES_URL_PATTERN)
  if (!isGithubIssues) {
    return
  }

  const links = [].slice.call(document.querySelectorAll('.comment-body a'))
  const limitedLinks = links.slice(0, GITHUB_ISSUES_LINKS_LIMIT)
  await attachStarsOnLinksAsync(limitedLinks)
}

async function initAwesomeStarsAsync () {
  await Promise.all([
    initForReadmeAsync(),
    initForGithubIssuesAsync()
  ])
}

function showUpdateNotification () {
  const $emptyContainer = document.createElement('div')
  const $jsFlashContainer = document.getElementById('js-flash-container')
  $jsFlashContainer.appendChild($emptyContainer)
  ReactDOM.render(<UpdateNotification />, $emptyContainer)
}

async function checkUpdateNotificationSentAsync () {
  const {data: updateNotificationSent} = await messageClient.message(
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
