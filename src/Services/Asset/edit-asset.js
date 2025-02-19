import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function editAssetDetails(reqData) {
  try {
    const res = await post(`${URL.editAssetDetails}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
