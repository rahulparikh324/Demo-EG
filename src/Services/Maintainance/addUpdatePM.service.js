import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function addUpdatePM(reqData) {
  try {
    const res = await post(`${URL.addUpdatePM}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
