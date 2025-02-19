import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function updateMultiWOCategoryTaskStatus(reqData) {
  try {
    const res = await post(`${URL.updateMultiWOCategoryTaskStatus}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
