import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getFormByWOTaskId({ id }) {
  try {
    if (id) {
      const res = await get(`${URL.getFormByWOTaskId}/${id}`)
      return res.data
    }
  } catch (error) {
    return error
  }
}
