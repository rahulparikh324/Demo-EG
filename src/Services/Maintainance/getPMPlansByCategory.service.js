import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getPMPlansByCategory(id) {
  try {
    const res = await get(`${URL.getPMPlansByCategory}/${id}`)
    if (res.data.success !== 1) return { list: [] }
    return res.data.data
  } catch (error) {
    return { list: [] }
  }
}
