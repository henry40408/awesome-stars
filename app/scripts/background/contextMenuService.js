import includes from 'lodash/includes'

class ContextMenuService {
  MENU_RATE_LIMIT = 'rateLimit'
  MENU_APPLY_ON_GITHUB_ISSUES = 'applyOnGithubIssues'

  constructor (ctx) {
    this.menuIds = []
  }

  upsert (id, options) {
    if (!includes(this.menuIds, id)) {
      chrome.contextMenus.create({id, ...options})
      this.menuIds.push(id)
    }
    chrome.contextMenus.update(id, options)
  }
}

export default ContextMenuService
