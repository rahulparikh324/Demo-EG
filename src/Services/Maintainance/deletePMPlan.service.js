import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function deletePMPlan(id) {
  try {
    const res = await get(`${URL.deletePMPlan}/${id}`)
    return res.data
  } catch (error) {
    return error
  }
}
