import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getAllInspectionForm(companyId) {
  try {
    const res = await get(`${URL.getAllInspectionFormByCompanyId}/${companyId}`)
    return res.data
  } catch (error) {
    return error
  }
}
