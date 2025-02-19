import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function addRequest(reqData) {
  try {
    const res = await post(`${URL.addUpdateMaintenanceRequest}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
