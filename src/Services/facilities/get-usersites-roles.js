import get from '../getService'
import URL from '../../Constants/apiUrls'

const getActiveUserSitesAndRoles = async uuid => {
  try {
    const res = await get(`${URL.facilities.getUserSitesAndRoles}/${uuid}`)
    return res.data
  } catch (error) {
    return error
  }
}

export default getActiveUserSitesAndRoles
