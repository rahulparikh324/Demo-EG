import get from '../getService'

export default function getFeaturewiseURL(type) {
  return new Promise((resolve, reject) => {
    get(`Dashboard/GetFeatureWiseURLs/${type}`)
      .then(response => resolve(response))
      .catch(error => reject(error))
  })
}
