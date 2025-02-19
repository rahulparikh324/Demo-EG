import get from './getService'
import URL from '../Constants/apiUrls'

export default function companyList() {
  return new Promise((resolve, reject) => {
    get(URL.getAllCompany)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
