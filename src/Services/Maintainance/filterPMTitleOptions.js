import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function filterPMTitleOptions(reqData) {
  try {
    const res = await post(`${URL.filterPMTitles}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
