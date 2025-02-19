import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getAllFormNames(pageIndex, pageSize = 20) {
  try {
    const res = await get(`${URL.getAllFormNames}/${pageSize}/${pageIndex}`)
    return res.data
  } catch (error) {
    return error
  }
}
