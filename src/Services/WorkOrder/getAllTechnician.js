import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function getAllTechnicians(reqData) {
  try {
    const res = await post(`${URL.getAllTechnician}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
