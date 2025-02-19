import get from '../getService'
import URL from '../../Constants/apiUrls'

export default function inspectionList(urlParamerter) {
  return new Promise((resolve, reject) => {
    var url = URL.getInspectionListByAssetId + urlParamerter
    get(url)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
