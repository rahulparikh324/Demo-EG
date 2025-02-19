import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function filterWONos(reqData) {
  try {
    const res = await post(`${URL.filterWorkOrderNumberOptions}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
