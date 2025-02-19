import get from '../getService'

export default async function getAllOperatorsList() {
  const { uuid } = JSON.parse(localStorage.getItem('loginData'))
  try {
    const res = await get(`User/GetAllOperatorsList?userid=${uuid}`)
    if (res.data.success !== 1) return []
    return res.data.data.list
  } catch (error) {
    return []
  }
}
