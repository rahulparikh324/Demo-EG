import get from 'Services/getService'
import post from '../postService'
import URL from 'Constants/apiUrls'

export default async function getAllTechnicianList({ siteId }) {
  try {
    const res = await get(`${URL.user.allTechnicianList}/${siteId}`)
    if (res.data.success !== 1) return { list: [] }
    return res.data.data
  } catch (error) {
    return { list: [] }
  }
}
