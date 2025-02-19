import put from './putService'

export default function updateActiveCompany(requestData) {
  return new Promise((resolve, reject) => {
    put(`user/ActiveCompany`, requestData)
      .then(response => resolve(response))
      .catch(error => reject(error))
  })
}
