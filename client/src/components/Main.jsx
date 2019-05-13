import React from 'react'
import TabItems from './TabItems'
import Tab from './Tab'

export default class Main extends React.Component {

  render() {
    const { username, changeTab, activeTab, focus, csrf } = this.props

    return (
      <main>
        <TabItems {...{ changeTab }} />
        <Tab {...{ username, activeTab, changeTab, focus, csrf }}/>
      </main>
    )
  }
}
