import post from '../postService'
import URL from '../../Constants/apiUrls'

export default function uploadInspectionForms(requestData) {
  return new Promise((resolve, reject) => {
    post(URL.uploadInspectionForms, requestData)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
