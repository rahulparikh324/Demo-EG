import post from '../postService'
import URL from '../../Constants/apiUrls'

export default function uploadAsset(requestData) {
  return new Promise((resolve, reject) => {
    post(URL.uploadAsset, requestData)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
