import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getWOCategoryTaskByCategoryID({ id }) {
  try {
    const res = await get(`${URL.getWOCategoryTaskByCategoryID}/${id}`)
    return res.data
  } catch (error) {
    return error
  }
}
