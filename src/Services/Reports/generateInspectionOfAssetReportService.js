import post from '../postService'
import URL from '../../Constants/apiUrls'

export default function generateInspectionOfAssetReport(requestData) {
  return new Promise((resolve, reject) => {
    var url = URL.GenerateInspectionOfAssetReport
    post(url, requestData)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
