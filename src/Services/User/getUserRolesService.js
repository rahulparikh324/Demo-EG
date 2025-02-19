import get from '../getService'
import URL from '../../Constants/apiUrls'

export default function getUserRoles() {
  return new Promise((resolve, reject) => {
    var url = URL.getUserRole
    get(url)
      .then(response => resolve(response))
      .catch(error => reject(error))
  })
}
