import React from 'react'
import fetch from '../helpers/fetch'

export default class Settings extends React.Component {

  componentDidMount = async () => {
    const { focus } = this.props

    if (focus === 'subreddit') {
      this.subredditInput.focus()
    }
  }

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  // addAlert
  addAlert = async e => {
    const { changeTab, csrf } = this.props
    e.preventDefault()
    e.persist()
    const addAlert = document.querySelectorAll('.add-alert')[0]
    addAlert.classList.add('loading')
    const addInputs = Array.from(document.querySelectorAll(`.add input[type='text']`))
    const body = addInputs.reduce((acc, cur) => {
      acc[cur.getAttribute('name')] = cur.value
      return acc
    },{})
    const result = await fetch({
      url: '/api/add_alert',
      method: 'post',
      csrf, body
    })
    addAlert.classList.remove('loading')
    if (!result.err) {
      return setTimeout(() => {
        changeTab(e,'alerts')
      }, 500)
    }
    alert(result.err)
  }

  // addCard
  addCard = async () => {
    alert(`This functionality isn't available yet.`)
  }

  // signOut
  signOut = async e => {
    e.persist()
    const { changeTab, csrf } = this.props
    const result = await fetch({
      method: 'put',
      url: '/api/sign_out',
      csrf
    })
    if (!result.err) {
      return setTimeout(() => {
        changeTab(e,'alerts')
        alert('You have been signed out.')
      }, 500)
    }
    alert(result.err)
  }

  // deleteAccount
  deleteAccount = async e => {
    e.persist()
    const { changeTab, csrf } = this.props
    if (window.confirm('Are you sure you want to delete your account? Everything will be deleted.')) {
      const result = await fetch({
        method: 'delete',
        url: '/api/delete_account',
        csrf
      })
      if (!result.err) {
        return setTimeout(() => {
          changeTab(e,'alerts')
          alert('Your account has been deleted.')
        }, 500)
      }
      alert(result.err)
    }
  }

  render () {
    const { addAlert, addCard, signOut, deleteAccount } = this

    return (
      <div className="settings">

        {/* add alert */}
        <div className="setting">
          <div className="titles">
            <h2 className="title">Add Alert</h2>
            <p className="subtitle">You will be emailed any time a Reddit post matches your search word.</p>
          </div>
          <form className="add" action="/" method="post">
            <input type="text" name="subreddit" placeholder="Subreddit" ref={input => { this.subredditInput = input }} autoCorrect="off" autoCapitalize="none"/>
            <input type="text" name="word" placeholder="Word" autoCorrect="off" autoCapitalize="none"/>
            <input type="text" name="email" placeholder="Email" autoCorrect="off" autoCapitalize="none"/>
            <button type="submit" onClick={addAlert} className="btn add-alert">Add Alert</button>
          </form>
        </div>

        {/* delete */}
        <div className="setting">
          <div className="titles">
            <h2 className="title">Add card</h2>
            <p className="subtitle">Alerts cost $0.50 / alert / year (after first 5).</p>
          </div>
          <button onClick={addCard} className="btn add-card">Add Card</button>
        </div>

        {/* signout */}
        <div className="setting">
          <div className="titles">
            <h2 className="title">Sign out</h2>
            <p className="subtitle">Sign out of your account.</p>
          </div>
          <button onClick={signOut} className="btn sign-out">Sign Out</button>
        </div>

        {/* add card */}
        <div className="setting">
          <div className="titles">
            <h2 className="title">Delete account</h2>
            <p className="subtitle">This action cannot be undone.</p>
          </div>
          <button onClick={deleteAccount} className="btn danger delete-account">Delete Account</button>
        </div>

      </div>
    )
  }
}
