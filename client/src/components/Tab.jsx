import React from 'react'
import Alerts from './Alerts'
import Settings from './Settings'

export default class Tab extends React.Component {
  render() {
    const { username, activeTab, changeTab, focus, csrf } = this.props

    return (
      <div className="tab">
        {/* no user */}
        { !username && <span className="note">Log in to your Reddit account get started.</span> }

        {/* alerts tab active */}
        { username && activeTab === 'alerts' && <Alerts {...{ username, changeTab, csrf }}/> }

        {/* settings tab active */}
        { username && activeTab === 'settings' && <Settings {...{ focus, changeTab, csrf }}/> }
      </div>
    )
  }
}
