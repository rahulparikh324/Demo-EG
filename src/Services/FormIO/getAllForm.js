import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getAllForms({ pageIndex, pageSize = 20, searchString = '' }) {
  try {
    const res = await get(`${URL.getAllForms}?pageindex=${pageIndex}&pagesize=${pageSize}&search_string=${searchString}`)
    return res.data
  } catch (error) {
    return error
  }
}
