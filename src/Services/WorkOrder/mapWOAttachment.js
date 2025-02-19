import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function mapWOAttachment(reqData) {
  try {
    const res = await post(`${URL.mapWOAttachmenttoWO}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
