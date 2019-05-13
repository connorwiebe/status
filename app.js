if (process.env.NODE_ENV === 'development') require('dotenv').config()

const express = require('express')
const app = express()
const appRouter = require('express-promise-router')()
const path = require('path')
const favicon = require('serve-favicon')
const bodyParser = require('body-parser')
const isEmail = require('is-email')
const cid = require('crypto-alphanumeric-id')
const compression = require('compression')
const helmet = require('helmet')
const rp = require('request-promise')
const knex = require('knex')(require('./helpers/database')())

const csrf = require('./helpers/csrf')
const sessions = require('./helpers/sessions')
const api = require('./helpers/api')
const to = require('./helpers/to')
const err = require('./helpers/err')
const ratelimit = require('./helpers/ratelimit')
const sendgrid = require('./helpers/sendgrid')
const timestamp = require('./helpers/timestamp')
const ping = require('./helpers/ping').ping

app.listen(process.env.PORT || 2222)
const dev = process.env.NODE_ENV === 'development'
const prod = process.env.NODE_ENV === 'production'
if (prod) appRouter.use(compression({ threshold: 0 }))
if (prod) appRouter.use(helmet())
if (prod) app.set('trust proxy', 1)
appRouter.use(bodyParser.json(), bodyParser.urlencoded({ extended: false }))
appRouter.use(express.static(path.join(__dirname, 'client/dist'), { maxAge: prod ? 2628002880 : 0 })) // 1 week : 0 ms
appRouter.use(favicon(path.join(__dirname, 'client/dist/images/logo.png')))
appRouter.use(sessions(), csrf)

if (dev) {
  appRouter.use((req, res, next) => {
    console.log(`${req.method} -> ${req.url}`)
    next()
  })
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ api ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// ping
ping.on('ping', async matches => {
  const dbPosts = await knex('posts')

  // check matches, send emails
  for (let match of matches) {
    for (let post of match.posts) {
      const dbPost = dbPosts.filter(dbPost => dbPost.username === match.alert.username && dbPost.post_id === post.name)[0]
      if (dbPost || match.alert.failures >= 10) {
        continue
      }
      const { canSend } = await ratelimit.emails(match.alert.username)
      if (!canSend) break

      const [e,result] = await to(sendgrid({
        subject: `New post in ${post.subreddit_name_prefixed} matching your alert with the word '${match.alert.word}'`,
        to: match.alert.email,
        message: [ `<a href='${post.url}'>${post.title}</a>` ]
      }))

      if (e) {
        await knex('alerts').where({username:match.alert.username}).andWhere({alert_id:match.alert.alert_id}).increment('failures',1)
        continue
      }

      await knex('posts').insert({
        post_id: post.name,
        username: match.alert.username,
        alert_id: match.alert.alert_id
      })

      await knex('alerts').where({username:match.alert.username}).andWhere({alert_id:match.alert.alert_id}).increment('successes',1)
    }
  }
})

// restricts routes to logged in users only
const usersOnly = (req, res, next) => {
  if (!req.session.username) return next(err(401,'Client tried to access a users only route.'))
  next()
}

// reddit login
appRouter.get('/login', async (req, res, next) => {
  if (req.session.username) return res.redirect('/')
  const id = process.env.REDDIT_ID
  const cb = process.env.REDDIT_CB
  res.redirect(302,`https://www.reddit.com/api/v1/authorize?client_id=${id}&response_type=code&state=jZeED4K6g3mjf8BWAcEsWDnb&redirect_uri=${cb}&duration=permanent&scope=identity+read`)
})

// reddit callback
appRouter.get('/login/callback', async (req, res, next) => {
  const code = req.query.code
  if (!code) return next(err(400,`User without code attempted to access Reddit callback.`))
  const { access_token, refresh_token } = await api.getAccessTokens({code})

  // insert user
  const me = await api.get({endpoint: '/api/v1/me', initToken: access_token})
  let newUid = await cid(4)
  const [e] = await to(knex('users').insert({ username: me.body.name, access_token, refresh_token, uid: newUid }))
  if (e && e.constraint !== 'users_pkey') return next(e)
  if (e) var { uid } = await knex.select('uid').from('users').where({ username: me.body.name }).first()

  // set session props
  req.session.csrf = await cid(7)
  req.session.username = me.body.name
  req.session.uid = uid || newUid
  if (!e) req.session.event = { category: 'Account Event', action: 'Account Created' }
  req.session.save(() => res.redirect(dev ? 'http://localhost:8080/' : 'https://status123.herokuapp.com'))
})

// get mount
appRouter.get('/api/mount', async (req, res, next) => {
  const { username = null, csrf, uid, event } = req.session
  if (req.session.event) req.session.event = null
  res.send({ username, prod, csrf, uid, event })
})

// get alerts
appRouter.get('/api/alerts', usersOnly, async (req, res, next) => {
  const username = req.session.username
  const alerts = await knex('alerts').where({ username })
  res.send(alerts)
})

// add alert
appRouter.post('/api/add_alert', usersOnly, async (req, res, next) => {
  const username = req.session.username
  const { subreddit, word, email } = req.body
  const { count } = await knex.count('alert_id').from('alerts').where({ username }).first()

  // validation
  if (+count >= 5) return next(err(400,`Add card to create more alerts.`))
  if (!subreddit || !word || !email) return next(err(400,`Missing input.`))
  if (subreddit.length > 100 || word.length > 100 || email.length > 254) return next(err(400,`Input too long.`))
  if (!isEmail(email)) return next(err(400,`Invalid email address.`))

  // make sure the subreddit exists
  let e,about
  ;[e,about] = await to(api.get({endpoint:`/r/${subreddit}/about.json`, username}))
  if (e && e.statusCode === 404) return next(err(400,`Subreddit doesn't exist.`))
  if (e) return next(e)

  // insert new alert
  const alert_id = await cid(4)
  ;[e] = await to(knex('alerts').insert({ alert_id, email, subreddit: about.body.data.display_name_prefixed, word, username }))
  if (e && e.constraint === 'alerts_subreddit_word_username_key') return next(err(400,`You already have an alert with that subreddit and word.`))
  if (e) return next(e)
  res.end()
})

// delete alert
appRouter.delete('/api/delete_alert', usersOnly, async (req, res, next) => {
  const username = req.session.username
  const { alert_id } = req.body
  await knex('alerts').where({ username, alert_id }).del()
  res.end()
})

// sign out
appRouter.put('/api/sign_out', usersOnly, async (req, res, next) => {
  req.session.destroy(() => res.end())
})

// delete account
appRouter.delete('/api/delete_account', usersOnly, async (req, res, next) => {
  const username = req.session.username
  await knex('users').where({username}).del()
  req.session.destroy(() => res.end())
})

// wrap application to next(err) all unhandled promsies
app.use(appRouter)

// error handling
appRouter.use((req,res,next) => next({code: 404}))
appRouter.use(async (err, req, res, next) => {
  if (dev) console.error(err)
  if (err.statusCode) err.code = err.statusCode
  if (!err.code || typeof err.code !== 'number') err.code = 500
  if (err.code === 500 && prod) {
    const errs = Object.getOwnPropertyNames(err).map(item => err[item]).filter(item => item)
    await sendgrid({
      subject: `Server Crash: ${timestamp()}`,
      to: process.env.MY_EMAIL,
      message: [ `<p>${errs}</p>` ]
    })
    process.exitCode = 1
  }
  res.status(err.code)
  res.send({err: err.message || `Unknown Error. We're working on it.`})
})
