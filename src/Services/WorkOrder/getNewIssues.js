import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function getNewIssues(data) {
  try {
    const res = await post(`${URL.getNewIssuesList}`, data)
    return res.data
  } catch (error) {
    return error
  }
}
