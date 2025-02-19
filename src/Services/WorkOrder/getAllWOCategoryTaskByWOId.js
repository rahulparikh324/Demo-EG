import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getAllWOCategoryTaskByWOId(workOrderID) {
  try {
    const res = await get(`${URL.getAllWOCategoryTaskByWOId}/${workOrderID}`)
    return res.data
  } catch (error) {
    return error
  }
}
