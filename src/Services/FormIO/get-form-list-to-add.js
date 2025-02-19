import get from '../getService'
import URL from '../../Constants/apiUrls'

const getFormListToAdd = async ({ id }) => {
  try {
    const res = await get(`${URL.getFormListToAddByAssetclassID}/${id}`)
    return res.data
  } catch (error) {
    return error
  }
}

export default getFormListToAdd
