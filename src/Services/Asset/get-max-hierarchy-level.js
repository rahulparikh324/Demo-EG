import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getAssetHierarchyLevelOptions() {
  try {
    const res = await get(`${URL.getAssetHierarchyLevelOptions}`)
    return res.data
  } catch (error) {
    return error
  }
}
