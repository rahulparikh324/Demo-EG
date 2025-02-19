import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function updateStatusToReady(reqData) {
  try {
    const res = await post(`${URL.updateSubmittedStatus}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
