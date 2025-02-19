import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function duplicatePlan(reqData) {
  try {
    const data = { pm_plan_id: reqData }
    const res = await post(`${URL.duplicatePMPlan}`, data)
    return res.data
  } catch (error) {
    return error
  }
}
