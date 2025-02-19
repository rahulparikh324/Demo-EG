import put from './putService'
import URL from '../Constants/apiUrls'

export default function UpdateActiveRoleService(requestData) {
  return new Promise((resolve, reject) => {
    put(URL.updateActiveRole, requestData)
      .then(response => resolve(response))
      .catch(error => reject(error))
  })
}
