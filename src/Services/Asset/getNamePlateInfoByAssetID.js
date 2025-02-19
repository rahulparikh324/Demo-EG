import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getNamePlateInfoByAssetID(id) {
  try {
    const res = await get(`${URL.getNameplateInfoByAssetid}/${id}`)
    return res.data
  } catch (error) {
    return error
  }
}
