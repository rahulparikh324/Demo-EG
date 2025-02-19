import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getPdfGenerationStatus(asset_form_id) {
  try {
    const res = await get(`${URL.getPdfGenerationStatus}?asset_form_id=${asset_form_id}`)
    return res.data
  } catch (error) {
    return error
  }
}
