import get from '../getService'
import URL from 'Constants/apiUrls'

const getAssetsToAssign = async () => {
  try {
    const res = await get(`${URL.getAssetsForSubmittedFilterOptions}`)
    return res.data
  } catch (error) {
    return error
  }
}

export default getAssetsToAssign
