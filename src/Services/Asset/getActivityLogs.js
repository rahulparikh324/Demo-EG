import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getActivityLogs(index, filter, id) {
  try {
    const url = id ? `&asset_id=${id}` : ''
    const res = await get(`${URL.GetAssetActivityLogs}?pageindex=${index}&pagesize=20&filter_type=${filter}${url}`)
    return res.data
  } catch (error) {
    return error
  }
}
