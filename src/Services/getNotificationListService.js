import get from './getService'
import URL from '../Constants/apiUrls'

export default function notificationList(urlParameters) {
  return new Promise((resolve, reject) => {
    var url = URL.getNotificationList + urlParameters
    get(url)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
