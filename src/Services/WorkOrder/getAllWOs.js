import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function getAllMR(reqData) {
  try {
    const res = await post(`${URL.getAllWorkOrdersNewflow}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
