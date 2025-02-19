import axios from 'axios'
import URL from 'Constants/apiUrls'

const exportPDF = async data => {
  return new Promise((resolve, reject) => {
    const request = axios({
      method: 'POST',
      url: `http://localhost:3000/get-work-order-pdf`,
      timeout: 100000,
      data,
    })
    request.then(response => resolve(response.data)).catch(error => reject('Network Error'))
  })
}

export default exportPDF
