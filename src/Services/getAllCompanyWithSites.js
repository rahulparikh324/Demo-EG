import get from './getService'
import URL from '../Constants/apiUrls'

export default function getAllCompanyWithSites() {
  return new Promise((resolve, reject) => {
    get(URL.getAllCompanyWithSites)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
