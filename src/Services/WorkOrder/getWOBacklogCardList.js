import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function getWOBacklogCardList(reqData) {
  try {
    const res = await post(`${URL.GetWOBacklogCardListV2}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
