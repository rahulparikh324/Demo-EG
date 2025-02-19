import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function addUpdatePMCategory(reqData) {
  try {
    const res = await post(`${URL.addUpdatePMCategory}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
