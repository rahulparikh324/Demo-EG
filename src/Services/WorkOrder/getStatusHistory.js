import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getWOToAssign(woID) {
  try {
    const res = await get(`${URL.workOrderStatusHistory}/${woID}`)
    return res.data
  } catch (error) {
    return error
  }
}
