import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getPMsByPlan(id) {
  try {
    const res = await get(`${URL.getPMsByPlan}/${id}`)
    if (res.data.success !== 1) return { list: [] }
    return res.data.data
  } catch (error) {
    return { list: [] }
  }
}
