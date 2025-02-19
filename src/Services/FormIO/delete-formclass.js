import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function deleteFormFromClass(reqData) {
  try {
    const res = await post(`${URL.deleteFormFromAssetClass}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
