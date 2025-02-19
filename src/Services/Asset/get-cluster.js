import get from '../getService'
import URL from '../../Constants/apiUrls'
import { isEmpty } from 'lodash'

export default async function getCluster({ wo_id = null }) {
  try {
    let url = URL.getAllAssetForCluster
    if (!isEmpty(wo_id)) {
      url += '?wo_id=' + wo_id
    }
    const res = await get(url)
    return res.data
  } catch (error) {
    return error
  }
}
