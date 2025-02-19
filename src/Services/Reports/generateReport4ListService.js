import get from '../getService'
import URL from '../../Constants/apiUrls'

export default function GenerateReport4List(urlParameters) {
  return new Promise((resolve, reject) => {
    var url = URL.latestHourReadingReport
    get(url)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
