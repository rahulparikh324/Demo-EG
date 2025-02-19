import axios from 'axios'
import URL from '../../Constants/apiUrls'
import getDomainName from '../../helpers/getDomainName'
import { getApplicationStorageItem } from 'helpers/getStorageItem'

function verfiyEmail(email) {
  return new Promise((resolve, reject) => {
    const request = axios({
      method: 'POST',
      url: URL.BASE + URL.verifyEmail,
      timeout: 100000,
      headers: {
        'Content-Type': 'application/json',
        Site_id: getApplicationStorageItem('siteId'),
        Role_id: getApplicationStorageItem('roleId'),
        User_Session_Id: localStorage.getItem('userLoginSessionId'),
        'x-sensaii-auth-type': 'credentials',
        'x-sensaii-platform-type': 'web',
        domain_name: getDomainName(),
        appbrand: 2,
      },
      data: {
        email: email,
        domain_name: getDomainName(),
      },
    })
    request.then(response => resolve(response)).catch(error => reject('Network Error'))
  })
}

export default verfiyEmail
