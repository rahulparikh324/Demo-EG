import axios from 'axios'

export default function uploadQrCodeImage(reqData) {
  return new Promise((resolve, reject) => {
    const request = axios({
      method: 'POST',
      url: `https://api.qrserver.com/v1/read-qr-code/`,
      data: reqData,
    })
    request.then(response => resolve(response)).catch(error => reject('Network Error'))
  })
}
