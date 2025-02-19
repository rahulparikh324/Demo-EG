import get from '../getService'
import URL from '../../Constants/apiUrls'

export default function inspectionList(urlParameters) {
  return new Promise((resolve, reject) => {
    get(URL.getInspections + urlParameters)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
