import post from '../postService'

export default async function getAllAssetAndFilter(reqData) {
  try {
    const res = await post(`Asset/FilterAsset`, reqData)
    if (res.data.success !== 1) return { list: [], listsize: 0 }
    return res.data.data
  } catch (error) {
    return { list: [], listsize: 0 }
  }
}
