import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getAssetNotifications(id) {
  try {
    const res = await get(`${URL.getAssetNotifications}/${id}`)
    return res.data
  } catch (error) {
    return error
  }
}
