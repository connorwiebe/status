import React from 'react'
import ReactDOM from 'react-dom'
import fetch from './helpers/fetch'
import Nav from './components/Nav'
import Main from './components/Main'
import Footer from './components/Footer'
import './sass.sass'


class App extends React.Component {

  state = {
    activeTab: 'alerts',
    username: undefined
  }

  componentDidMount = async () => {
    const { username, prod, csrf, event } = await fetch('/api/mount')
    Object.assign(this, { prod, csrf })
    this.setState({ username })
  }

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


  // show active tab using target or specified tab name
  changeTab = (e, tab) => {
    let { username } = this.state
    const target = !tab ? e.target : document.querySelectorAll(`[data-name='${tab}']`)[0]
    const tabItems = document.getElementsByClassName('tab-item')
    for (let tabItem of tabItems) {
      tabItem.classList.remove('active')
    }
    target.classList.add('active')
    const classList = e.target.classList
    if (classList.contains('faux-add-alert')) this.focus = 'subreddit'
    if (classList.contains('delete-account') || classList.contains('sign-out')) username = null
    window.scrollTo(0,0)
    this.setState({ activeTab: target.getAttribute('data-name'), focus: this.focus, username })
  }

  render () {
    const { username, activeTab } = this.state
    const { changeTab, prod, csrf, focus } = this
    if (username === undefined) return null

    return (
      <div className="wrapper">
        <Nav {...{ username, changeTab, prod }}/>
        <Main {...{ username, changeTab, activeTab, focus, csrf }}/>
        <Footer/>
      </div>
    )
  }
}

ReactDOM.render(<App/>, document.getElementById('app'))

//--App
  //--Nav
  //--Main
    //--TabItems
    //--Tab
      //--Alerts
      //--Settings
  //--Footer
