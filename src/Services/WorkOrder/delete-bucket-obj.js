import post from '../postService'
import URL from '../../Constants/apiUrls'

export default async function deleteBucketObject(reqData) {
  try {
    const res = await post(`${URL.deleteS3BucketObject}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
