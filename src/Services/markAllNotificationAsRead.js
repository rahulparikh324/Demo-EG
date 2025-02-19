import get from './getService'
import URL from '../Constants/apiUrls'

export default async function markAllNotificationAsRead() {
  try {
    const res = await get(`${URL.markAllNotificationAsRead}`)
    if (res.data.success !== 1) return res.data
    return res.data
  } catch (error) {
    return error
  }
}
