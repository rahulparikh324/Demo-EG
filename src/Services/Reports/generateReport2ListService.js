import get from '../getService'
import URL from '../../Constants/apiUrls'

export default function GenerateReport2List(urlParameters) {
  return new Promise((resolve, reject) => {
    var url = URL.generateReportWeekly + urlParameters
    get(url)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
