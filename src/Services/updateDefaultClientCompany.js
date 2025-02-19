import put from './putService'

export default function updateDefaultClientCompany(requestData) {
  return new Promise((resolve, reject) => {
    put(`user/DefaultClientCompany`, requestData)
      .then(response => resolve(response))
      .catch(error => reject(error))
  })
}
