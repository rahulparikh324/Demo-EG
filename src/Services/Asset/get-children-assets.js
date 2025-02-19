import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getChildrenAssets(id) {
  try {
    const res = await get(`${URL.getChildrenAssetsByAssetID}/${id}`)
    return res.data
  } catch (error) {
    return error
  }
}
