import post from '../postService'
import URL from '../../Constants/apiUrls'
export default function createWorkorder(requestData) {
  return new Promise((resolve, reject) => {
    post(URL.createWorkOrder, requestData)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
