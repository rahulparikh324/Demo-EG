import post from '../postService'
import URL from 'Constants/apiUrls'

export default async function generateBulkNetaReport(payload) {
  try {
    const res = await post(`${URL.generateBulkNetaReport}`, payload)
    return res.data
  } catch (error) {
    return error
  }
}
