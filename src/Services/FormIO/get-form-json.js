import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function getFormJson(reqData) {
  try {
    const res = await post(`${URL.getAssetsFormJson}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
