import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getWODetails(woID) {
  try {
    const res = await get(`${URL.getWorkOrderDetails}/${woID}`)
    return res.data
  } catch (error) {
    return error
  }
}
