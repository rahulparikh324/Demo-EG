import post from 'Services/postService'
import URL from 'Constants/apiUrls'

export default async function changeAssetHierarchy(reqData) {
  try {
    const res = await post(`${URL.changeAssetHierarchy}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
