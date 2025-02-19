import axios from 'axios'
import URL from 'Constants/apiUrls'

const getCompanyLogos = async ({ id }) => {
  return new Promise((resolve, reject) => {
    const request = axios({
      method: 'GET',
      url: `${URL.BASE}${URL.getCompanyLogos}?company_code=${id}`,
      timeout: 100000,
    })
    request.then(response => resolve(response.data)).catch(error => reject('Network Error'))
  })
}

export default getCompanyLogos
