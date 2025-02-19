import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function deleteWOCategoryTask(reqData) {
  try {
    const res = await post(`${URL.deleteWOCategoryTask}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
