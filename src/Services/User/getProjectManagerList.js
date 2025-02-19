import get from 'Services/getService'
import URL from 'Constants/apiUrls'

export default async function getProjectManagerList() {
  try {
    const res = await get(URL.user.getProjectManagers)
    if (res.data.success !== 1) return { list: [] }
    return res.data.data
  } catch (error) {
    return { list: [] }
  }
}
