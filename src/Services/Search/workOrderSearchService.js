import get from '../getService'
import URL from '../../Constants/apiUrls'

export default function workOrderSearchList(urlParamerter) {
  return new Promise((resolve, reject) => {
    var url = URL.getWorkOrderBySearch + urlParamerter
    get(url)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
