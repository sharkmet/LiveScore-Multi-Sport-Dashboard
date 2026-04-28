/**
 * Adapter registry.
 * To add a league: write src/adapters/<league>.js and import it here.
 * Nothing else changes.
 */

import * as mlbAdapter from './mlb.js'
import * as nhlAdapter from './nhl.js'
import * as nbaAdapter from './nba.js'
import * as nflAdapter from './nfl.js'

const adapters = [mlbAdapter, nhlAdapter, nbaAdapter, nflAdapter]

export default adapters
