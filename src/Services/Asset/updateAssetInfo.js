import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function updateAssetInfo(reqData) {
  try {
    const res = await post(`${URL.updateAssetInfo}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
