import post from '../postService'
import URL from '../../Constants/apiUrls'

export default function updateUserStatus(requestData) {
  return new Promise((resolve, reject) => {
    post(URL.updateUserStatus, requestData)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
