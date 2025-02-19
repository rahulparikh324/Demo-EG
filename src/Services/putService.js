import axios from 'axios'
import URL from '../Constants/apiUrls'
import getToken from './getToken'
import getDomainName from '../helpers/getDomainName'
import tokenValid from '../tokenValid'
import { handleError } from 'helpers/api-error-handler'

export default function put(url, requestData, responseType = 'json') {
  return new Promise((resolve, reject) => {
    const isTokenExpire = tokenValid()
    if (isTokenExpire) {
      getToken()
        .then(response => {
          apiCall(url, requestData, (responseType = 'json'), response)
            .then(response => resolve(response))
            .catch(error => reject(error))
        })
        .catch(error => {
          console.log('putService.put.getToken catch error -', error)
          reject(error)
        })
    } else {
      apiCall(url, requestData, responseType, localStorage.getItem('accessToken'))
        .then(response => resolve(response))
        .catch(error => reject(error))
    }
  })
}

const apiCall = (url, requestData, responseType = 'json', token) => {
  const siteId = sessionStorage.getItem('siteId')
  const roleId = sessionStorage.getItem('roleId')
  const selectedSiteId = localStorage.getItem('selectedSiteId')
  return new Promise((resolve, reject) => {
    const request = axios({
      method: 'PUT',
      url: URL.BASE + url,
      data: requestData,
      responseType,
      headers: {
        'Content-Type': 'application/json',
        Site_id: selectedSiteId != null && selectedSiteId != undefined ? selectedSiteId : siteId !== null ? siteId : localStorage.getItem('siteId'),
        Role_id: roleId !== null ? roleId : localStorage.getItem('roleId'),
        User_Session_Id: localStorage.getItem('userLoginSessionId'),
        Token: token,
        Domain_Name: getDomainName(),
        'x-sensaii-auth-type': 'credentials',
        'x-sensaii-platform-type': 'web',
        appbrand: 2,
      },
    })
    request
      .then(response => resolve(response))
      .catch(error => {
        handleError(error, url, reject)
      })
  })
}
