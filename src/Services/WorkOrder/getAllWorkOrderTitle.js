import get from '../getService'

export default async function getAllWorkOrderTitle() {
  const { uuid } = JSON.parse(localStorage.getItem('loginData'))
  try {
    const res = await get(`Issue/GetAllIssueTitle?userid=${uuid}`)
    if (res.data.success !== 1) return []
    return res.data.data.list
  } catch (error) {
    return []
  }
}
