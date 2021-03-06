import { h, render, Component } from 'preact'
import config from '../config'

class Popup extends Component {
  constructor () {
    super()
    chrome.storage.local.get(null, state => {
      this.setState({
        browsers: state.browsers,
        enabled: state.enabled,
        custom: state.custom,
        customUA: state.customUA,
        os: state.os,
        browser: state.browser
      })
    })
    this.checkUrl = 'https://www.whatsmyua.info/'
  }

  close () {
    setTimeout(() => window.close(), 200)
  }

  toggle (e) {
    const enabled = e.target.checked
    this.setState({ enabled })
    chrome.storage.local.set({ enabled })
    if (!enabled) this.close()
  }

  setOs (e) {
    const os = e.target.value
    if (os === 'custom') {
      this.setState({ custom: true })
      chrome.storage.local.set({ custom: true })
    } else {
      const browser = config.ui
        .find(({ platform }) => platform === os).browsers[0]
      this.setState({ custom: false, os, browser })
      chrome.storage.local.set({ custom: false, os, browser })
    }
  }

  setBrowser (e) {
    const browser = e.target.value
    this.setState({ browser })
    chrome.storage.local.set({ browser })
    this.close()
  }

  setCustomUA (e) {
    const customUA = e.target.value || ''
    console.log(customUA)
    this.setState({ customUA })
    chrome.storage.local.set({ customUA })
  }

  trimVersion (version) {
    const match = version.match(/^(\d+)\.(\d+)/)
    if (match) {
      const major = match[1]
      const minor = match[2]
      return minor === '0' ? major : `${major}.${minor}`
    }
    return version
  }

  openCheckPage () {
    chrome.tabs.create({ url: 'https://www.whatsmyua.info/' })
  }

  render (props, state) {
    if (!state.browsers) return
    return <div class="popup">
      <div class="row">
        <h3 class="header">UA Smart Switcher</h3>
        <a href="" class="check" onClick={this.openCheckPage}>check</a>
        { state.enabled != null &&
          <label class="switch right">
            <input type="checkbox" checked={state.enabled}
              onChange={this.toggle.bind(this)} />
            <span class="slider round"></span>
          </label>
        }
      </div>
      <div class="row">
        <span>Platform:</span>
        <select class="right" disabled={!state.enabled}
          value={state.custom ? 'custom' : state.os} onChange={this.setOs.bind(this)}>
          {
            config.ui.map(({ platform }) => (
              <option value={platform}>{config.platforms[platform].name}</option>
            ))
          }
          <option value="custom">Custom UA</option>
        </select>
      </div>
      {
        !state.custom && <div class="row">
          <span>Browser:</span>
          <select class="right" disabled={!state.enabled}
            value={state.browser} onChange={this.setBrowser.bind(this)}>
            {
              config.ui.find(({ platform }) => platform === state.os).browsers.map(browser => {
                const agent = state.browsers[browser][state.os]
                return <option value={browser}>
                  {config.browsers[browser].name} {this.trimVersion(agent.version)}
                </option>
              })
            }
          </select>
        </div>
      }
      {
        state.custom && <div class="row">
          <textarea disabled={!state.enabled} placeholder="Paste a user agent string here"
            onInput={this.setCustomUA.bind(this)}>{state.customUA}</textarea>
        </div>
      }
    </div>
  }
}

render(<Popup />, document.querySelector('#container'))
