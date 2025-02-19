import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function deleteAssetClass(reqData) {
  try {
    const res = await post(`${URL.deleteAssetClass}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
