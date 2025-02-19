import get from '../getService'
import URL from '../../Constants/apiUrls'

export default function getUserProfileDetail(urlprameters) {
  return new Promise((resolve, reject) => {
    var url = URL.getUserDetailById + urlprameters
    get(url)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
