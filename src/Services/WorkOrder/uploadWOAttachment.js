import post from '../postServiceUpload'
import URL from '../../Constants/apiUrls'

export default async function uploadWOAttachment(reqData) {
  try {
    const res = await post(`${URL.uploadWorkOrderAttachment}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
