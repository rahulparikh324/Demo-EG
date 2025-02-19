import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getAllAssetForTree() {
  try {
    const res = await get(`${URL.getAllAssetForTree}`)
    return res.data
  } catch (error) {
    return error
  }
}
