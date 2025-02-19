import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function getAssetformByIDForBulkReport(reqData) {
  try {
    const res = await post(`${URL.getAssetformByIDForBulkReport}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
