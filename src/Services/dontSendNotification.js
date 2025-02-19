import get from './getService'
import URL from '../Constants/apiUrls'

export default async function dontSendNotification(trigger_id) {
  try {
    const res = await get(`${URL.triggerPMItemNotification}?trigger_id=${trigger_id}&is_disabled=true`)
    if (res.data.success !== 1) return res.data
    return res.data
  } catch (error) {
    return error
  }
}
