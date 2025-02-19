import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function resendTemporaryPassword(uuid) {
  try {
    const res = await get(`${URL.resendTempPassword}?user_id=${uuid}`)
    if (res.data.success !== 1) return { msg: 'Something went wrong, please try again', type: 2 }
    return { msg: 'Temporary password sent successfully!', type: 1 }
  } catch (error) {
    return { msg: 'Something went wrong, please try again', type: 2 }
  }
}
