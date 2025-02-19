import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function createInspection(reqData) {
  try {
    const res = await post(`${URL.createInspection}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
