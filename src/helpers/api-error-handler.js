import enums from 'Constants/enums'
import { Toast } from 'Snackbar/useToast'
import _ from 'lodash'
import { history } from './history'
import getDomainName from './getDomainName'

export const handleError = (error, url, reject) => {
  let msg = !_.isEmpty(_.get(error, 'request.response.message', '')) ? _.get(error, 'request.response.message', '') : 'Something went wrong !'
  if (!_.isEmpty(error.request.response) && (error.request.status === 401 || error.request.status === 403)) {
    console.log('API URL - ', url)
    console.log('API RESPONSE - ', error.request)
    const { status } = error.request
    if (status === 401) {
      const messageShown = localStorage.getItem('toastMessageShown') === 'true'
      if (messageShown) {
        let errorMsg = null
        if (typeof error.request.response !== 'object') {
          errorMsg = JSON.parse(error.request.response)
        } else {
          errorMsg = error.request.response
        }
        if (errorMsg.success === 440) {
          Toast.warning(enums.resMessages.status_440, 'toast-error-440')
          msg = enums.resMessages.status_440
          localStorage.setItem('toastMessageShown', 'false')
          history.push('/login')
        } else {
          Toast.error(enums.resMessages.status_401, 'toast-error-401')
          msg = enums.resMessages.status_401
        }
        localStorage.clear()
        localStorage.setItem('domainName', getDomainName())
        history.push('/login')
      }
    } else if (status === 403) {
      Toast.error(enums.resMessages.status_403, 'toast-error-403')
      msg = enums.resMessages.status_403
    }
  }
  reject(msg)
}

export const handleErrorUpload = (error, url, reject) => {
  let msg = 'Network Error'
  if (!_.isEmpty(error.request.response) && (error.request.status === 401 || error.request.status === 403)) {
    console.log('API URL - ', url)
    console.log('API RESPONSE - ', error.request)
    const { status } = error.request
    if (status === 401) {
      Toast.error(enums.resMessages.status_401, 'toast-error-401')
      localStorage.clear()
      localStorage.setItem('domainName', getDomainName())
      history.push('/login')
      msg = enums.resMessages.status_401
    } else if (status === 403) {
      Toast.error(enums.resMessages.status_403, 'toast-error-403')
      msg = enums.resMessages.status_403
    }
  }
  reject(msg)
}
