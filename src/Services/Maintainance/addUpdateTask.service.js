import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function addUpdateTask(reqData) {
  try {
    const res = await post(`${URL.addUpdateTask}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
