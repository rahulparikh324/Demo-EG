import get from '../getService'
import URL from '../../Constants/apiUrls'

const getFormListByClass = async ({ id }) => {
  try {
    const res = await get(`${URL.getFormsByAssetclassID}/${id}`)
    return res.data
  } catch (error) {
    return error
  }
}

export default getFormListByClass
