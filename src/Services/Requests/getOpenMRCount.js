import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getOpenMRCount() {
  try {
    const res = await get(`${URL.getMaintenanceRequestOpenStatusCount}`)
    return res.data
  } catch (error) {
    return error
  }
}
