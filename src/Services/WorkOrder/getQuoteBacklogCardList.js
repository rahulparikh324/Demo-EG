import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function getQuoteBacklogCardList(reqData) {
  try {
    const res = await post(`${URL.GetQuoteListStatusWiseV2}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
