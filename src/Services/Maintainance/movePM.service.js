import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function movePM(reqData) {
  try {
    const res = await post(`${URL.movePM}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
