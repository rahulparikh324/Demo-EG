import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function filterDevice(reqData) {
  try {
    const res = await post(URL.filterDevice, reqData)
    if (res.data.success !== 1) return { list: [], listsize: 0 }
    return res.data.data
  } catch (error) {
    return { list: [], listsize: 0 }
  }
}
