import get from './getService'
import URL from '../Constants/apiUrls'

export default async function getPMNotificationConfig() {
  try {
    const res = await get(`${URL.getPMNotificationConfig}/${localStorage.getItem('companyId')}`)
    if (res.data.success !== 1) return res.data
    return res.data
  } catch (error) {
    return error
  }
}
