import put from './putService'

export default function updateClientCompany(requestData) {
  return new Promise((resolve, reject) => {
    put(`user/ActiveClientCompany`, requestData)
      .then(response => resolve(response))
      .catch(error => reject(error))
  })
}
