import get from '../getService'
import URL from '../../Constants/apiUrls'

export default function assetList(urlParameters) {
  return new Promise((resolve, reject) => {
    var url = URL.getAssets + '/' + urlParameters
    get(url)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
