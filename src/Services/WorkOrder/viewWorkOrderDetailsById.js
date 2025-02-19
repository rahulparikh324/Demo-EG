import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function ViewWorkOrderDetailsById(woID) {
  try {
    const res = await get(`${URL.viewWorkOrderDetailsById}/${woID}`)
    return res.data
  } catch (error) {
    return error
  }
}
