import React, { Component } from 'react'
import Main from './components/Main/MainComponent'
import { Router, Route } from 'react-router-dom'
import { createTheme, MuiThemeProvider } from '@material-ui/core/styles'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'
import $ from 'jquery'
import { history } from '../src/helpers/history'
import * as Sentry from '@sentry/browser'
import { Toaster } from 'react-hot-toast'
import CircularProgress from '@material-ui/core/CircularProgress'
import MainProvider from 'components/Main/provider'

// Sentry.init({
//   dsn: 'https://e6e4baf0aa134399a6dc855645ea190c@sentry.io/3641219',
//   integrations(integrations) {
//     return integrations.filter(integration => integration.name !== 'Breadcrumbs')
//   },
// })

const theme = createTheme({
  palette: {
    primary: {
      //main: '#146481',
      main: '#778899',
    },
    secondary: {
      main: '#26a4d7',
    },
  },
  typography: {
    fontFamily: ['Manrope-Regular', 'Manrope-Medium', 'Manrope-Bold', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"'].join(','),
  },
})

class App extends Component {
  constructor(props) {
    super(props)

    const { dispatch } = this.props
    history.listen((location, action) => {
      //console.log("histroy changed")
    })
  }

  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <MainProvider>
          <Router history={history}>
            <div id='pageLoading' className='loadingbg' style={{ zIndex: 100000 }}>
              <CircularProgress style={{ position: 'absolute', top: '50%', left: '50%' }} size={48} thickness={5} />
            </div>
            <ToastContainer />
            <Main />
            <Toaster toastOptions={{ className: 'toast-container' }} />
          </Router>
        </MainProvider>
      </MuiThemeProvider>
    )
  }
}

export default App
