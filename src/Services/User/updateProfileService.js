import post from '../postService'
import URL from '../../Constants/apiUrls'

export default function updateUserProfile(requestData) {
  return new Promise((resolve, reject) => {
    post(URL.addUpdateUser, requestData)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
