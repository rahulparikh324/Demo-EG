import get from '../getService'
import URL from 'Constants/apiUrls'

const getInspectedByOptions = async () => {
  try {
    const res = await get(`${URL.geInspectedForSubmittedFilterOptions}`)
    return res.data
  } catch (error) {
    return error
  }
}

export default getInspectedByOptions
