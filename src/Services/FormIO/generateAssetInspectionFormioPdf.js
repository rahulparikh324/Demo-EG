import post from '../postService'
import URL from 'Constants/apiUrls'

export default async function generateAssetInspectionFormioPdf(reqData) {
  try {
    const res = await post(`${URL.generateAssetInspectionFormioPdf}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
