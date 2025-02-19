import post from '../postService'

export default async function deviceFilterOptions(URL, reqData) {
  try {
    const res = await post(`Device/${URL}`, reqData)
    if (res.data.success !== 1) return { list: [] }
    return res.data.data
  } catch (error) {
    return { list: [] }
  }
}
