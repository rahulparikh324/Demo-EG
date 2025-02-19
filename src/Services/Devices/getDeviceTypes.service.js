import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getDeviceTypes() {
  try {
    const res = await get(URL.getDeviceTypes)
    if (res.data.success !== 1) return []
    return res.data.data
  } catch (error) {
    return []
  }
}
