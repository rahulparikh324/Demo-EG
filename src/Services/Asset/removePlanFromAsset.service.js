import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function removePlanFromAsset(id) {
  try {
    const res = await get(`${URL.removeAssetPM}/${id}`)
    return res.data
  } catch (error) {
    return error
  }
}
