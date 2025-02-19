import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function deleteWO(reqData) {
  try {
    const res = await post(`${URL.deleteWorkOrder}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
