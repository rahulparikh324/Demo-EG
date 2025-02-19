import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getDeviceModels() {
  try {
    const res = await get(URL.getDeviceModels)
    if (res.data.success !== 1) return []
    return res.data.data
  } catch (error) {
    return []
  }
}
