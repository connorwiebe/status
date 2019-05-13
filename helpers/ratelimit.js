const moment = require('moment')
const redis = require('./redis')

// emails rate limiter
const emails = async username => {

  // get the ratelimiter for this user
  let ratelimit = await redis.get(`ratelimit:emails:${username}`)

  // ratelimit doesn't exist, create it
  if (!ratelimit) {
    await redis.setex(`ratelimit:emails:${username}`, 1, 60*60*24) // 24 hours
    return { canSend: true }
  }

  // increment the ratelimit value
  ratelimit = await redis.incr(`ratelimit:emails:${username}`)

  // ratelimit exceeds daily value
  if (ratelimit >= 100) return { canSend: false, expiry: moment(+ratelimit).fromNow().replace('in ','') }

  // ratelimit doesn't exceed daily value
  return { canSend: true }
}

exports.emails = emails
