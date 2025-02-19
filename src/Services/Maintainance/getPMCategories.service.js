import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getPMCategories() {
  try {
    const res = await get(`${URL.getPMCategory}`)
    if (res.data.success !== 1) return { list: [] }
    return res.data.data
  } catch (error) {
    return { list: [] }
  }
}
