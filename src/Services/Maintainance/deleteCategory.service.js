import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function deleteCategory(id) {
  try {
    const res = await get(`${URL.deletePMCategory}/${id}`)
    return res.data
  } catch (error) {
    return error
  }
}
