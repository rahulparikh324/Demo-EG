import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getSubComponents(id, size, index) {
  try {
    const res = await get(`${URL.getSubAssetsByAssetID}/${id}/${size}/${index}`)
    return res.data
  } catch (error) {
    return error
  }
}
