import get from '../getService'

export default async function getAllAssetModelYears() {
  try {
    const res = await get(`Asset/AllAssetsModelYear`)
    if (res.data.success !== 1) return []
    return res.data.data
  } catch (error) {
    return []
  }
}
