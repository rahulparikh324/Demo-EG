import React, { Component } from 'react'
import ErrorFallback from 'components/error-fallback-ui'
import { history } from 'helpers/history'
import { Toast } from 'Snackbar/useToast'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true }
  }
  componentDidCatch(error, errorInfo) {
    history.push('/dashboard')
    console.log('%c ⛔ ERROR !!', 'font-weight: bold; font-size: 20px;color: red; text-shadow: 1px 1px 0 rgb(217,31,38) , 2px 2px 0 rgb(226,91,14) , 3px 3px 0 rgb(245,221,8)')
    console.log(error, errorInfo)
    Toast.error(error)
  }
  render() {
    if (this.state.hasError) {
      return null
    }
    return this.props.children
  }
}
