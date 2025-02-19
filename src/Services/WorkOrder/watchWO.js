import URL from 'Constants/apiUrls'
import post from '../postService'

export default async function watchWO(reqData) {
  try {
    const res = await post(`${URL.workOrderWatching}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
