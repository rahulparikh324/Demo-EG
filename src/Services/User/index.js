import URL from 'Constants/apiUrls'
import api from 'Services/api-call'

const user = {
  profile: {
    uploadPhoto: payload => api(`${URL.user.profile.uploadPhoto}`, payload, true),
    update: payload => api(`${URL.user.profile.update}`, payload, true),
  },
}

export default user
