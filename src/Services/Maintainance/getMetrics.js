import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getMetrics() {
  try {
    const res = await get(`${URL.getMetrics}`)
    return res.data
  } catch (error) {
    return error
  }
}
