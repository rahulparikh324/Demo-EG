import get from '../getService'
import URL from '../../Constants/apiUrls'

export default function workOrderList(urlParamerter) {
  return new Promise((resolve, reject) => {
    var url = URL.getWorkorderListByAssetId + urlParamerter
    get(url)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
