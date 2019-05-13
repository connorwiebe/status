module.exports = args => {

  // get
  if (typeof args === 'string') {
    return window.fetch(args, { method: 'get', credentials: 'include' }).then(response => {
      return response.text().then(result => {
        if (result) result = JSON.parse(result)
        return result
      })
    }).catch(err => {
      return {err: `Unknown Error. We're working on it.`}
    })
  }

  // post, put and delete
  return window.fetch(args.url, {
    headers: new Headers({
      'csrf': args.csrf,
      'content-type': 'application/json'
    }),
    body: JSON.stringify(args.body),
    method: args.method,
    credentials: 'include'
  }).then(response => {
    return response.text().then(result => {
      if (result) result = JSON.parse(result)
      return result
    })
  }).catch(err => {
    return {err: `Unknown Error. We're working on it.`}
  })


}
