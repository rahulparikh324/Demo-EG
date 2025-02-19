import put from '../putService'
import URL from '../../Constants/apiUrls'

export default async function updateAssetPM(reqData) {
  try {
    const res = await put(`${URL.updateAssetPM}`, reqData)
    if (res.data.success !== 1) return res.data
    return res.data
  } catch (error) {
    return error
  }
}
