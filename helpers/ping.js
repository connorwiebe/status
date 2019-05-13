const EventEmitter = require('events').EventEmitter
const api = require('./api')
const to = require('./to')
const knex = require('knex')(require('./database')())
const match = require('match-words')

const ping = new EventEmitter()
let errCount = 0

const cycle = async () => {
  const alerts = await knex('alerts')
  const a = process.hrtime()

  let [e,posts] = await to(api.get({endpoint: '/r/all/new?limit=100'}))

  if (e && e.statusCode !== 500) {
    if (errCount++ > 10) throw e
    return cycle() // stress test this
  }
  if (e) throw e

  const remaining = Math.round(posts.headers['x-ratelimit-remaining'])
  let minutes = posts.headers['x-ratelimit-reset'] / 60
  const seconds = Math.round(60 * (minutes % 1))
  minutes = Math.floor(minutes)

  posts = posts.body.data.children
  const matches = alerts.reduce((acc,alert) => {
    const matched = posts.filter(post => {
      if (post.data.subreddit_name_prefixed === alert.subreddit && match(post.data.title).includes(alert.word)) {
        return post
      }
    }).map(post => post.data)
    if (matched.length) acc.push({posts:matched,alert})
    return acc
  },[])

  console.log(`${remaining} calls left. Limit resets in: ${minutes}m ${seconds}s. That took: ${process.hrtime(a)[0]}.${(process.hrtime(a)[1]/1000000).toString()[0]}s.`)
  if (matches.length) ping.emit('ping', matches)
  setTimeout(cycle, 5000)
}
setTimeout(cycle, 5000) // dont go below 2000

exports.ping = ping
