import get from '../getService'
import URL from '../../Constants/apiUrls'

const getFormProperties = async ({ id }) => {
  try {
    const res = await get(`${URL.getFormProperties}/${id}`)
    return res.data
  } catch (error) {
    return error
  }
}

export default getFormProperties
