import get from '../getService'
import enums from 'Constants/enums'

export default function getQuickSightEmbedURL(type = enums.DASHBOARD.INSIGHTS) {
  return new Promise((resolve, reject) => {
    get(`User/GetQuickSightUrl?dashboardtype=${type}`)
      .then(response => resolve(response))
      .catch(error => reject(error))
  })
}
