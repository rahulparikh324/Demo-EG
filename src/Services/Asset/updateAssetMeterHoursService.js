import put from '../putService'
import URL from '../../Constants/apiUrls'

export default function updateMeterHour(requestData) {
  return new Promise((resolve, reject) => {
    put(URL.updateMeterHour, requestData)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
