import React from 'react'

export default class TabItems extends React.Component {
  render() {
    const { changeTab } = this.props
    return (
      <ul className="tab-items">
        <li onClick={e => changeTab(e)} data-name="alerts" className="tab-item active">Alerts</li>
        <li onClick={e => changeTab(e)} data-name="settings" className="tab-item">Settings</li>
      </ul>
    )
  }
}
