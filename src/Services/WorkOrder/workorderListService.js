import get from '../getService'
import URL from '../../Constants/apiUrls'
export default function workorderList(urlParameters) {
  return new Promise((resolve, reject) => {
    var newUrl = URL.getWorkOrder + '/' + urlParameters
    get(newUrl)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
