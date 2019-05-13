import React from 'react'

export default class Footer extends React.Component {
  render() {
    return (
      <footer>
        <div className="colophon">status</div>
        <div className="index">
          <div className="index-items">

            <div className="index-item">
              <div className="about">About</div>
              <div className="tooltip"  data-tooltip="status was created in 48 hours."></div>
            </div>

            <div className="index-item">
              <div className="pricing">Pricing</div>
              <div className="tooltip" data-tooltip="$0.50 / alert / year (after first 5)."></div>
            </div>

            <div className="index-item">
              <div className="legal">Legal</div>
              <div className="tooltip" data-tooltip="Don't do bad stuff."></div>
            </div>

            <div className="index-item">
              <div className="contact">Contact</div>
              <div className="tooltip" data-tooltip="Connor Wiebe"></div>
            </div>

          </div>
        </div>
      </footer>
    )
  }
}
