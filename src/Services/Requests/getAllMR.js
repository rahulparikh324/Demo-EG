import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function getAllMR(reqData) {
  try {
    const res = await post(`${URL.getAllMaintenanceRequest}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
