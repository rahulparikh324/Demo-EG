import post from '../postService'

export default async function getAllCatagoryForWO(reqData) {
  try {
    const res = await post(`WorkOrder/GetAllCatagoryForWO`, reqData)
    return res.data.data
  } catch (error) {
    return error
  }
}
