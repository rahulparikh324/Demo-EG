import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function deletePM(id) {
  try {
    const res = await get(`${URL.deletePM}/${id}`)
    return res.data
  } catch (error) {
    return error
  }
}
