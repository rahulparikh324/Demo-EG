import get from './getService'
import URL from '../Constants/apiUrls'

export default function logout(urlParameters) {
  return new Promise((resolve, reject) => {
    var url = URL.logout
    get(url)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
