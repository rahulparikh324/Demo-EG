import post from '../postService'
import URL from '../../Constants/apiUrls'

export default function assetDetail(requestData) {
  return new Promise((resolve, reject) => {
    post(URL.getAssetDetails, requestData)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
