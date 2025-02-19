import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getWOCategoryTaskByWOId({ workOrderID, status }) {
  try {
    const res = await get(`${URL.getWOCategoryTaskByWOId}/${workOrderID}/${status}`)
    return res.data
  } catch (error) {
    return error
  }
}
