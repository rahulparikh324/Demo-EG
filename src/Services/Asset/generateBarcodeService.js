import post from '../postServicepdf'
import URL from '../../Constants/apiUrls'

export default function generateBarcode(requestData) {
  return new Promise((resolve, reject) => {
    post(URL.generateBarcode, requestData, 'blob')
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
