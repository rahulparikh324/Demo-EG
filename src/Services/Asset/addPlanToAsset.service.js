import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function addPlanToAsset(reqData) {
  try {
    const res = await post(`${URL.addPlanToAsset}`, reqData)
    if (res.data.success !== 1) return res.data
    return res.data
  } catch (error) {
    return error
  }
}
