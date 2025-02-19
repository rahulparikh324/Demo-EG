import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getWOToAssign({ assetID, pageIndex, searchString }) {
  try {
    const res = await get(`${URL.getAllWorkOrderWithNoMR}/${assetID}?pageindex=${pageIndex}&pagesize=${20}&searchstring=${searchString}`)
    return res.data
  } catch (error) {
    return error
  }
}
