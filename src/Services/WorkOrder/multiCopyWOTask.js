import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function multiCopyWOTask(reqData) {
  try {
    const res = await post(`${URL.multiCopyWOTask}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
