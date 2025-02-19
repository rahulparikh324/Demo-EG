import get from '../getService'
import URL from '../../Constants/apiUrls'

export default function validateAssetId(urlParameters) {
  return new Promise((resolve, reject) => {
    var url = URL.validateAssetId + urlParameters
    get(url)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
