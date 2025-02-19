import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function deleteAssetPM(id) {
  try {
    const res = await get(`${URL.deleteAssetPM}/${id}`)
    return res.data
  } catch (error) {
    return error
  }
}
