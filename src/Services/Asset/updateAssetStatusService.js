import post from '../postService'
import URL from '../../Constants/apiUrls'

export default function updateAssetStatus(requestData) {
  return new Promise((resolve, reject) => {
    post(URL.updateAssetStatus, requestData)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
