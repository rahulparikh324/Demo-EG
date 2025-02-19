import axios from 'axios'
import URL from '../Constants/apiUrls'
import getToken from './getToken'
import tokenValid from '../tokenValid'
import getDomainName from '../helpers/getDomainName'
import { handleErrorUpload } from 'helpers/api-error-handler'

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
        'Content-Type': 'multipart/form-data',
        Site_id: selectedSiteId != null && selectedSiteId != undefined ? selectedSiteId : siteId !== null ? siteId : localStorage.getItem('siteId'),
        Role_id: roleId !== null ? roleId : localStorage.getItem('roleId'),
        User_Session_Id: localStorage.getItem('userLoginSessionId'),
        Token: token,
        'x-sensaii-auth-type': 'credentials',
        'x-sensaii-platform-type': 'web',
        domain_name: getDomainName(),
      },
    })
    request
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        handleErrorUpload(error, url, reject)
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
            .then(response => {
              resolve(response)
            })
            .catch(error => {
              reject('Network Error')
            })
        })
        .catch(error => {
          {
            console.log('postServiceUpload.post.getToken catch error -', error)
            reject('Network Error')
          }
        })
    } else {
      postApiCall(url, requestData, (responseType = 'json'), localStorage.getItem('accessToken'))
        .then(response => {
          resolve(response)
        })
        .catch(error => {
          reject('Network Error')
        })
    }
  })
}
