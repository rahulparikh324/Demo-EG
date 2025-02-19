import get from '../getService'
import URL from '../../Constants/apiUrls'

export default function assetSearchList(urlParamerter) {
  return new Promise((resolve, reject) => {
    var url = URL.getAssetBySearch + urlParamerter
    get(url)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
