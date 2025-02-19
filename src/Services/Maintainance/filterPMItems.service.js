import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function filterPMtems(reqData) {
  try {
    const res = await post(`${URL.dashboardPendingPMItems}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
