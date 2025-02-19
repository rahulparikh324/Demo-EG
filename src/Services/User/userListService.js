import get from '../getService'
import URL from '../../Constants/apiUrls'

export default function userList(urlParameters) {
  return new Promise((resolve, reject) => {
    var url = URL.getAllUser + '/' + urlParameters
    get(url)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
