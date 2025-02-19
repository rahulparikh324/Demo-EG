import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getWOGridView(woID) {
  try {
    const res = await get(`${URL.getWOGridView}/${woID}`)
    return res.data
  } catch (error) {
    return error
  }
}
