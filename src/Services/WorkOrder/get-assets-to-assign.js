import get from '../getService'
import URL from 'Constants/apiUrls'

const getAssetsToAssign = async ({ id }) => {
  try {
    const res = await get(`${URL.getAssetsToAssign}/${id}`)
    return res.data
  } catch (error) {
    return error
  }
}

export default getAssetsToAssign
