import get from '../getService'
import URL from '../../Constants/apiUrls'

export default function userDetail(urlParameters) {
  return new Promise((resolve, reject) => {
    var url = URL.getUserDetailById + '/' + urlParameters
    get(url)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
