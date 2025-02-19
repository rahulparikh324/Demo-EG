import get from '../getService'
import URL from '../../Constants/apiUrls'

export default function historyOfInspectionAssetReport(urlParameters) {
  return new Promise((resolve, reject) => {
    var url = URL.historyOFInspectionAssetReport + urlParameters
    get(url)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
