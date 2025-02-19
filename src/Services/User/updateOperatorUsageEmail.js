import get from '../getService'
import URL from '../../Constants/apiUrls'

export default function updateOperatorUsageEmail(urlprameters) {
  return new Promise((resolve, reject) => {
    var url = URL.updateOperatorUsageEmailNotification + urlprameters
    get(url)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
