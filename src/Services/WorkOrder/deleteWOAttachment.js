import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function deleteWOAttachment(reqData) {
  try {
    const res = await post(`${URL.deleteWOAttachment}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
