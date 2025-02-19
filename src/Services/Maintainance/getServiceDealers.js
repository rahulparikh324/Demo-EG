import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getServiceDealers({ pageIndex, searchString }) {
  try {
    const params = searchString.length ? `${pageIndex}/10/${searchString}` : `${pageIndex}/10`
    const res = await get(`${URL.getAllServiceDealers}/${params}`)
    return res.data
  } catch (error) {
    return error
  }
}
