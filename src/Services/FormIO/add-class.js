import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function addAssetClass(reqData) {
  try {
    const res = await post(`${URL.addAssetClass}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
