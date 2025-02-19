import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getPlanForAsset(id, filter) {
  try {
    const res = await get(`${URL.getPlanForAsset}/${id}/${filter}`)
    if (res.data.success !== 1) return { list: [] }
    return res.data.data
  } catch (error) {
    return { list: [] }
  }
}
