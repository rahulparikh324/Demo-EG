import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function addUpdateWO(reqData) {
  try {
    const res = await post(`${URL.addUpdateWorkOrder}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
