import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function getAllWOsOptimized(reqData) {
  try {
    const res = await post(`${URL.getAllWorkOrdersOptimized}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
