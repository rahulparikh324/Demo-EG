import post from '../postService'
import URL from '../../Constants/apiUrls'

export default function approveInspection(requestData) {
  return new Promise((resolve, reject) => {
    post(URL.approveInspection, requestData)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
