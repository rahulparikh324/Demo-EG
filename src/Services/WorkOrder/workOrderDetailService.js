import get from '../getService'
import URL from '../../Constants/apiUrls'
export default function workorderDetail(uuid, workOrderId) {
  return new Promise((resolve, reject) => {
    get(URL.getWorkOrderDetail + '/' + workOrderId)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
