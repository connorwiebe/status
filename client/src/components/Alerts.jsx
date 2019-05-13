import React from 'react'
import fetch from '../helpers/fetch'

export default class Alerts extends React.Component {
  state = { alerts: undefined }

  async componentDidMount () {
    const { username } = this.props
    if (username) {
      const alerts = await fetch('/api/alerts')
      this.setState({ alerts })
    }
  }

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  // delete alert
  deleteAlert = async e => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      let { alerts } = this.state
      const { csrf } = this.props
      const alert_id = e.target.parentNode.getAttribute('data-id')
      alerts = alerts.filter(alert => alert.alert_id !== alert_id)
      const result = await fetch({
        url: '/api/delete_alert',
        body: { alert_id },
        method: 'delete',
        csrf
      })
      if (!result.err) {
        this.setState({ alerts })
      }
    }
  }

  render() {
    const { changeTab } = this.props
    const { alerts } = this.state
    const { deleteAlert } = this
    if (!alerts) return null

    const alertList = alerts.map(alert => {
      return <li className="alert" key={alert.alert_id} data-id={alert.alert_id}>
        <div className="cat">
          <div className="cat-title">Subreddit</div>
          <div className="cat-value">{alert.subreddit}</div>
        </div>
        <div className="cat">
          <div className="cat-title">Word</div>
          <div className="cat-value">{alert.word}</div>
        </div>
        <div className="cat">
          <div className="cat-title">Email</div>
          <div className="cat-value">{alert.email}</div>
        </div>
        <div className="cat">
          <div className="cat-title">Emails Sent</div>
          <div className="cat-value">{alert.successes}</div>
        </div>
        <button onClick={deleteAlert} className="material-icons delete">clear</button>
      </li>
    })

    return [
      <ol className="alerts" key={0}>{ alertList }</ol>,
      <button onClick={e => changeTab(e,'settings')} className="btn faux-add-alert" key={1}>Add Alert</button>
    ]

  }
}
