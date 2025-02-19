import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function addUpdateAsset(reqData) {
  try {
    const res = await post(`${URL.addUpdateAsset}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
