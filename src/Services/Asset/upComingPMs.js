import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getUpComingPMs() {
  try {
    const res = await get(`${URL.upComingPMs}`)
    if (res.data.success !== 1) return res.data.data
    return res.data.data
  } catch (error) {
    return error
  }
}
