import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function filterPMAssetNameOptions(reqData) {
  try {
    const res = await post(`${URL.filterPMAssetNames}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
