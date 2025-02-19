import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function getAssetForm(reqData) {
  try {
    const res = await post(`${URL.getAssetForm}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
