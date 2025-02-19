import post from './postService'
import URL from '../Constants/apiUrls'

export default async function updatePMNotificationConfig(reqData) {
  try {
    const res = await post(`${URL.updatePMNotificationConfig}`, reqData)
    if (res.data.success !== 1) return res.data
    return res.data
  } catch (error) {
    return error
  }
}
