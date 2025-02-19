import post from '../postService'

export default async function getAndFilterUsers(reqData) {
  try {
    const res = await post(`User/FilterUsers`, reqData)
    if (res.data.success !== 1) return { list: [], listsize: 0 }
    return res.data.data
  } catch (error) {
    return { list: [], listsize: 0 }
  }
}
