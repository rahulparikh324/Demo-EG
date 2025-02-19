import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getAllFormType({ pageIndex, searchString, pageSize = 100 }) {
  try {
    const res = await get(`${URL.getAllEquipmentList}/${pageIndex}/${pageSize}/${searchString}`)
    return res.data
  } catch (error) {
    return error
  }
}
