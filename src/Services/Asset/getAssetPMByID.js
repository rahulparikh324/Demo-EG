import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getAssetPMByID(id) {
  try {
    const res = await get(`${URL.getAssetPMByID}/${id}`)
    return res.data.data
  } catch (error) {
    return { list: [] }
  }
}
