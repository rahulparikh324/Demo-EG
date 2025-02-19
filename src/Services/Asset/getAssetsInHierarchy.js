import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function getAssetsInHierarchy(reqData) {
  try {
    const res = await post(`${URL.getAllHierarchyAssets}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
