import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function assignCategoryToWO(reqData) {
  try {
    const res = await post(`${URL.assignCategoryToWO}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
