import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getAllTask(pageIndex, searchString, pageSize = 10) {
  try {
    const res = await get(`${URL.getAllTask}?pageindex=${pageIndex}&pagesize=${pageSize}&searchstring=${searchString}`)
    if (res.data.success !== 1) return { list: [] }
    return res.data.data
  } catch (error) {
    return { list: [] }
  }
}
