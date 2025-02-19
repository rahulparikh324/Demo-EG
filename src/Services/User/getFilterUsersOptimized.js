import URL from 'Constants/apiUrls'
import post from '../postService'

export default async function getFilterUsersOptimized(reqData) {
  try {
    const res = await post(URL.user.filterUseroptimized, reqData)
    if (res.data.success !== 1) return { list: [], listsize: 0 }
    return res.data.data
  } catch (error) {
    return { list: [], listsize: 0 }
  }
}
