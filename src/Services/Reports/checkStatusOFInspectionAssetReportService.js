import post from '../postService'
import URL from '../../Constants/apiUrls'

export default function checkStatusOFInspectionAssetReport(requestData) {
  return new Promise((resolve, reject) => {
    var url = URL.CheckStatusOFInspectionAssetReport
    post(url, requestData)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
