const rp = require('request-promise')
const to = require('./to')
const redis = require('./redis')
const knex = require('knex')(require('./database')())

// get access tokens
const getAccessTokens = async args => {
  const { code, username } = args

  // format request
  const form = {}
  if (!code) {
    const { refresh_token } = await knex.select('refresh_token').from('users').where({username}).first()
    form.grant_type = 'refresh_token'
    form.refresh_token = refresh_token
  } else {
    form.grant_type = 'authorization_code'
    form.code = code
    form.redirect_uri = process.env.REDDIT_CB
  }

  const { access_token, refresh_token } = await rp({
    method: 'post',
    uri: 'https://www.reddit.com/api/v1/access_token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${process.env.REDDIT_ID}:${process.env.REDDIT_SECRET}`).toString('base64')}`
    },
    form,
    json: true
  })

  if (!code) await knex('users').update({access_token}).where({username})
  if (code) return { access_token, refresh_token }
}

// get data
const get = async args => {
  const { endpoint, initToken, username = process.env.REDDIT_USERNAME } = args

  const call = async () => {
    const { accessToken } = await knex.select('access_token as accessToken').from('users').where({username}).first()
    return rp({
      uri: `https://oauth.reddit.com${ endpoint }`,
      headers: {
        'User-Agent': `web:https://status123.herokuapp.com/:v0.1 (by /u/${username})`,
        'Authorization': `bearer ${ initToken || accessToken }`
      },
      resolveWithFullResponse: true,
      json: true
    })
  }

  const [e,result] = await to(call())
  if (!e) return result
  if ([401,403].includes(e.statusCode)) {
    await getAccessTokens({username})
  } else {
    throw e
  }

  return call()
}

exports.getAccessTokens = getAccessTokens
exports.get = get
