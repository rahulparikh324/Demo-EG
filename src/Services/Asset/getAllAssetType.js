import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getAllAssetType(index = 0, size = 0, search_string = '') {
  try {
    const res = await get(`${URL.getAllAssetTypes}/${index}/${size}/${search_string}`)
    return res.data
  } catch (error) {
    return error
  }
}
