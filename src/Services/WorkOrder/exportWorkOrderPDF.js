import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function exportWorkOrderPDF(woID) {
  try {
    const res = await get(`${URL.exportWorkOrderPDF}/${woID}`)
    return res.data
  } catch (error) {
    return error
  }
}
