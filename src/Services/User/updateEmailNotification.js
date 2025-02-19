import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function updateEmailNotification(urlprameters) {
  try {
    const res = await get(`${URL.updateExecutiveEmailNotificationStatus}${urlprameters}`)
    if (res.data.success !== 1) return { msg: 'Unable to update the setting, please try again', type: 2 }
    return { msg: 'Settings updated successfully!', type: 1 }
  } catch (error) {
    return { msg: 'Unable to update the setting, please try again', type: 2 }
  }
}
