import URL from 'Constants/apiUrls'
import api from 'Services/api-call'

const uploadImage = {
  uploadAssetNameplateImage: payload => api(`${URL.uploadAssetNameplateImage}`, payload, true),
}

export default uploadImage
