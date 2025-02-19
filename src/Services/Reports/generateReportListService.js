import get from '../getService'
import URL from '../../Constants/apiUrls'

export default function GenerateReportList(urlParameters) {
  return new Promise((resolve, reject) => {
    var url = URL.generateReportMonthy + urlParameters
    get(url)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
