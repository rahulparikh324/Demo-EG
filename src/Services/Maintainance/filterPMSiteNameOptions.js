import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function filterPMSiteNameOptions(reqData) {
  try {
    const res = await post(`${URL.filterPMSites}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
