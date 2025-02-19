import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function assignAsset(reqData) {
  try {
    const res = await post(`${URL.assignAssetToWOCategoryTask}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
