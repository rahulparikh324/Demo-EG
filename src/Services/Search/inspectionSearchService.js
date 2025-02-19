import get from '../getService'
import URL from '../../Constants/apiUrls'

export default function inspectionSearchList(urlParamerter) {
  return new Promise((resolve, reject) => {
    var url = URL.getInspectionBySearch + urlParamerter
    get(url)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
