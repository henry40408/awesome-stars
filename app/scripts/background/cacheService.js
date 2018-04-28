import LRU from 'lru-cache'

class CacheService extends LRU {
  constructor () {
    super({
      max: 5000,
      maxAge: 24 * 60 * 60 * 1000 // TTL = 24 hours
    })
  }
}

export default CacheService
