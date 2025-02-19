import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function createAcceptanceWO(reqData) {
  try {
    const res = await post(`${URL.createAcceptanceWO}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
