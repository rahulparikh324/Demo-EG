import put from './putService'
import URL from '../Constants/apiUrls'

export default function UpdateDefaultSiteService(requestData) {
  return new Promise((resolve, reject) => {
    put(URL.updateDefaultSite, requestData)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
