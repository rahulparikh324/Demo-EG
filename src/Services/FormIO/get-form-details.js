import get from '../getService'
import URL from '../../Constants/apiUrls'

const getFormDetails = async ({ id }) => {
  try {
    const res = await get(`${URL.getFormIOFormById}/${id}`)
    return res.data
  } catch (error) {
    return error
  }
}

export default getFormDetails
