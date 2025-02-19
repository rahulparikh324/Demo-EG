import post from '../postService'
import URL from '../../Constants/apiUrls'

export default function updateUser(requestData) {
  return new Promise((resolve, reject) => {
    post(URL.addUpdateUser, requestData)
      .then(response => {
        resolve(response.data)
      })
      .catch(error => {
        reject(error)
      })
  })
}
