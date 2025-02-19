import axios from 'axios'
import URL from '../Constants/apiUrls'
import getToken from './getToken'
import tokenValid from '../tokenValid'
import getDomainName from '../helpers/getDomainName'
import { handleError } from 'helpers/api-error-handler'

function postApiCall(url, requestData, responseType = 'json', token) {
  const siteId = sessionStorage.getItem('siteId')
  const roleId = sessionStorage.getItem('roleId')
  const selectedSiteId = localStorage.getItem('selectedSiteId')
  return new Promise((resolve, reject) => {
    var apiUrl = URL.BASE + url
    const request = axios({
      method: 'POST',
      url: apiUrl,
      data: requestData,
      responseType: responseType,
      // timeout:1000000,
      headers: {
        'Content-Type': 'application/json',
        Site_id: selectedSiteId != null && selectedSiteId != undefined ? selectedSiteId : siteId !== null ? siteId : localStorage.getItem('siteId'),
        Role_id: roleId !== null ? roleId : localStorage.getItem('roleId'),
        User_Session_Id: localStorage.getItem('userLoginSessionId'),
        Token: token,
        'x-sensaii-auth-type': 'credentials',
        'x-sensaii-platform-type': 'web',
        domain_name: getDomainName(),
        appbrand: 2,
      },
    })
    request
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        handleError(error, url, reject)
      })
  })
}

export default function post(url, requestData, responseType = 'json') {
  return new Promise((resolve, reject) => {
    var isTokenExpire = tokenValid()
    if (isTokenExpire) {
      getToken()
        .then(response => {
          postApiCall(url, requestData, (responseType = 'json'), response)
            .then(response => resolve(response))
            .catch(error => reject(error))
        })
        .catch(error => {
          console.log('postService.post.getToken catch error -', error)
          reject(error)
        })
    } else {
      postApiCall(url, requestData, responseType, localStorage.getItem('accessToken'))
        .then(response => resolve(response))
        .catch(error => reject(error))
    }
  })
}
