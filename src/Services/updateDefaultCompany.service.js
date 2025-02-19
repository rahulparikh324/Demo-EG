import put from './putService'

export default function updateDefaultCompany(requestData) {
  return new Promise((resolve, reject) => {
    put(`user/DefaultCompany`, requestData)
      .then(response => resolve(response))
      .catch(error => reject(error))
  })
}
