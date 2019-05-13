import React from 'react'

export default class Nav extends React.Component {

  render() {
    const { username, changeTab, prod } = this.props
    const url = prod ? 'https://status123.herokuapp.com' : 'http://localhost:2222'

    return (
      <nav>
        { username ? <button onClick={e => changeTab(e,'settings')} className="username">{username}</button> : <a href={`${url}/login`}><button className="btn">Login</button></a> }
        <h1>status</h1>
        <p>Create Reddit alerts.</p>
      </nav>
    )
  }
}
