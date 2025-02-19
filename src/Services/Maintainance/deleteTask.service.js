import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function deleteTask(id) {
  try {
    const res = await get(`${URL.deleteTask}/${id}`)
    return res.data
  } catch (error) {
    return error
  }
}
