import post from './postService'
import URL from '../Constants/apiUrls'

export default function login(requestData) {
  return new Promise((resolve, reject) => {
    post(URL.login, requestData)
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        //console.log("Login service catch-----------------",error);
        reject(error)
      })
  })
}
