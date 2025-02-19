import post from '../postService'

export default async function userFilterOptions(URL, reqData) {
  try {
    const res = await post(`User/${URL}`, reqData)
    if (res.data.success !== 1) return { list: [] }
    return res.data.data
  } catch (error) {
    return { list: [] }
  }
}
