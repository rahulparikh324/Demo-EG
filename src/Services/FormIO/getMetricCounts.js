import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getMetricCount() {
  try {
    const res = await get(`${URL.dashboardMetricCount}`)
    return res.data
  } catch (error) {
    return error
  }
}
