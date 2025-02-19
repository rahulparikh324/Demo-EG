import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function addFormInAssetClass(reqData) {
  try {
    const res = await post(`${URL.addFormInAssetClass}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
