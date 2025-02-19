import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function TriggerPMNotificationStatus(status) {
  try {
    const res = await get(`${URL.TriggerPMNotificationStatus}/${status}`)
    if (res.data.success !== 1) return res.data
    return res.data
  } catch (error) {
    return error
  }
}
