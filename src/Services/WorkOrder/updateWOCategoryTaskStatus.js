import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function updateWOCategoryTaskStatus(reqData) {
  try {
    const res = await post(`${URL.updateWOCategoryTaskStatus}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
