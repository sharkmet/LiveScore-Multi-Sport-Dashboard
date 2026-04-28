/**
 * StatsCache — in-memory cache for prefetched stats.
 *
 * - 6-hour TTL
 * - In-flight dedup via pendingFetches Map
 * - Token bucket rate limiter (30 req/min, refill 1 per 2s)
 * - LRU eviction at 500 entries
 * - Auto prune every 30 minutes
 */

const TTL_MS             = 6 * 60 * 60 * 1000 // 6 hours
const MAX_ENTRIES        = 500
const PRUNE_INTERVAL_MS  = 30 * 60 * 1000      // 30 minutes
const BUCKET_MAX         = 30
const REFILL_INTERVAL_MS = 2000                 // 1 token per 2s

export class StatsCache {
  constructor() {
    /** @type {Map<string, { value: any, expiresAt: number, lastAccessed: number }>} */
    this._cache = new Map()

    /** @type {Map<string, Promise<any>>} */
    this._pendingFetches = new Map()

    this._tokens     = BUCKET_MAX
    this._lastRefill = Date.now()

    this._pruneTimer = setInterval(() => this.pruneExpired(), PRUNE_INTERVAL_MS)
    if (this._pruneTimer?.unref) this._pruneTimer.unref()
  }

  /**
   * Get a cached value synchronously. Returns null if missing or expired.
   */
  get(key) {
    const entry = this._cache.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this._cache.delete(key)
      return null
    }
    entry.lastAccessed = Date.now()
    return entry.value
  }

  /**
   * Store a value with TTL. Evicts LRU entry if over MAX_ENTRIES.
   */
  set(key, value) {
    if (this._cache.size >= MAX_ENTRIES) this._evictLRU()
    this._cache.set(key, {
      value,
      expiresAt:    Date.now() + TTL_MS,
      lastAccessed: Date.now(),
    })
  }

  has(key) {
    return this.get(key) !== null
  }

  /**
   * Fetch with in-flight dedup and rate limiting.
   * @param {string} key
   * @param {() => Promise<any>} fetcher
   * @returns {Promise<any>}
   */
  async fetchWithDedup(key, fetcher) {
    const cached = this.get(key)
    if (cached !== null) return cached

    if (this._pendingFetches.has(key)) {
      return this._pendingFetches.get(key)
    }

    if (!this._consumeToken()) {
      throw new Error(`StatsCache: rate limit exceeded for ${key}`)
    }

    const promise = fetcher()
      .then(value => {
        this.set(key, value)
        this._pendingFetches.delete(key)
        return value
      })
      .catch(err => {
        this._pendingFetches.delete(key)
        throw err
      })

    this._pendingFetches.set(key, promise)
    return promise
  }

  pruneExpired() {
    const now = Date.now()
    for (const [key, entry] of this._cache.entries()) {
      if (now > entry.expiresAt) this._cache.delete(key)
    }
  }

  _evictLRU() {
    let oldestKey  = null
    let oldestTime = Infinity
    for (const [key, entry] of this._cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey  = key
      }
    }
    if (oldestKey) this._cache.delete(oldestKey)
  }

  _consumeToken() {
    this._refillTokens()
    if (this._tokens < 1) return false
    this._tokens -= 1
    return true
  }

  _refillTokens() {
    const now      = Date.now()
    const elapsed  = now - this._lastRefill
    const newTokens = Math.floor(elapsed / REFILL_INTERVAL_MS)
    if (newTokens > 0) {
      this._tokens     = Math.min(BUCKET_MAX, this._tokens + newTokens)
      this._lastRefill = now
    }
  }

  stats() {
    return { size: this._cache.size, pending: this._pendingFetches.size, tokens: this._tokens }
  }

  destroy() {
    if (this._pruneTimer) {
      clearInterval(this._pruneTimer)
      this._pruneTimer = null
    }
  }
}

// Singleton shared across the server
export const statsCache = new StatsCache()
