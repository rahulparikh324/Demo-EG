import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getPieChartCount() {
  try {
    const res = await get(`${URL.dashboardPieChartCount}`)
    return res.data
  } catch (error) {
    return error
  }
}
