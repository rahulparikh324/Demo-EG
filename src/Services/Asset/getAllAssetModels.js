import get from '../getService'

export default async function getAllAssetModels() {
  try {
    const res = await get(`Asset/AllAssetsModels`)
    if (res.data.success !== 1) return []
    return res.data.data
  } catch (error) {
    return []
  }
}
