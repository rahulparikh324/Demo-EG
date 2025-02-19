import get from '../getService'
import URL from 'Constants/apiUrls'

const getWoOptions = async () => {
  try {
    const res = await get(`${URL.getWorkOrdersForSubmittedFilterOptions}`)
    return res.data
  } catch (error) {
    return error
  }
}

export default getWoOptions
