import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function deleteWOCategory(reqData) {
  try {
    const res = await post(`${URL.deleteWOCategory}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
