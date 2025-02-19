import post from './postService'
import get from './getService'
import put from './putService'
import { camelizeKeys, snakifyKeys } from 'helpers/formatters'

const api = async (url, reqData, isPost, isPut) => {
  try {
    const res = isPost ? await post(url, snakifyKeys(reqData)) : isPut ? await put(url, snakifyKeys(reqData)) : await get(url)
    return camelizeKeys(res.data)
  } catch (error) {
    return error
  }
}

export default api
