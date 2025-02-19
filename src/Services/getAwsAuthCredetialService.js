import URL from '../Constants/apiUrls'
import axios from 'axios'
import getDomainName from '../helpers/getDomainName'
import { getApplicationStorageItem } from 'helpers/getStorageItem'

export default function getAwsAuthCredetial(companyCode) {
  return new Promise((resolve, reject) => {
    const apiUrl = `${URL.BASE}${URL.getAwsAuthCredetials}?company_code=${companyCode}`

    const request = axios({
      method: 'GET',
      url: apiUrl,
      timeout: 100000,
      headers: {
        'Content-Type': 'application/json',
        Site_id: getApplicationStorageItem('siteId'),
        Role_id: getApplicationStorageItem('roleId'),
        User_Session_Id: localStorage.getItem('userLoginSessionId'),
        Token: '',
        Domain_Name: getDomainName(),
      },
    })
    request.then(response => resolve(response)).catch(error => reject('Network Error'))
  })
}
