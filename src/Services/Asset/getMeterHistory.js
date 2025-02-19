import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function getMeterHourHistory(reqData) {
  try {
    const res = await post(`${URL.getAssetMeterHourHistory}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
