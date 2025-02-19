import api from '../api-call'
import URL from 'Constants/apiUrls'

const notes = {
  add: payload => api(`${URL.assetNotes.add}`, payload, true),
  get: payload => api(`${URL.assetNotes.get}`, payload, true),
}

export default notes
