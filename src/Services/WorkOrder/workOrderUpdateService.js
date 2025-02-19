import post from '../postService'
import URL from '../../Constants/apiUrls'
export default function updateWorkorder(requestData) {
  return new Promise((resolve, reject) => {
    post(URL.updateWorkOrder, requestData)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
