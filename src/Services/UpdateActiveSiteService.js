import put from './putService'
import URL from '../Constants/apiUrls'

export default function UpdateActiveSiteService(requestData) {
  return new Promise((resolve, reject) => {
    put(URL.updateActiveSite, requestData)
      .then(response => resolve(response))
      .catch(error => reject(error))
  })
}
