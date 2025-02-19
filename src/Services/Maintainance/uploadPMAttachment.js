import post from '../postServiceUpload'
import URL from '../../Constants/apiUrls'

export default async function uploadPMAttachment(reqData) {
  try {
    const res = await post(`${URL.uploadAttachment}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
