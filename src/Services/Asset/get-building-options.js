import get from '../getService'
import URL from '../../Constants/apiUrls'

export default async function getOptionsForBuildingFloorRoomSection() {
  try {
    const res = await get(`${URL.getOptionsForBuildingFloorRoomSection}`)
    return res.data
  } catch (error) {
    return error
  }
}
