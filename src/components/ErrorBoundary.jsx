import { Component } from 'react'
import { AlertTriangle, Home, RotateCcw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('LeapIntoChem activity failed safely', error, info)
  }

  componentDidUpdate(previousProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="tool-error" role="alert">
        <AlertTriangle />
        <p className="eyebrow">Activity stopped safely</p>
        <h1>This simulation could not start on this device.</h1>
        <p>No student work was uploaded or stored. Try reloading the activity; if the problem continues, return to the tool menu and choose another model.</p>
        <div>
          <button className="primary-button" onClick={() => window.location.reload()}><RotateCcw size={17} /> Reload activity</button>
          <button className="quiet-button" onClick={() => { window.location.hash = ''; window.location.reload() }}><Home size={17} /> All tools</button>
        </div>
      </div>
    )
  }
}
