import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function deleteForm(reqData) {
  try {
    const res = await post(`${URL.deleteForm}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
