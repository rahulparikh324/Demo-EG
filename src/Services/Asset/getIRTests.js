import post from 'Services/postService'
import URL from 'Constants/apiUrls'

const getIRTests = async reqData => {
  try {
    const res = await post(`${URL.getInsulationResistanceTests}`, reqData)
    return res.data
  } catch (error) {
    return error
  }
}
export default getIRTests
