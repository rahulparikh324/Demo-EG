import get from '../getService'
import URL from '../../Constants/apiUrls'

export default function updateEmailNotification(urlprameters) {
  return new Promise((resolve, reject) => {
    var url = URL.updateEmailNotification + urlprameters
    get(url)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
