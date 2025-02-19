import get from '../getService'
import URL from '../../Constants/apiUrls'

export default function getAllAssetIdList(urlParameters) {
  return new Promise((resolve, reject) => {
    var url = URL.GetAllAssetIDList
    get(url)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
