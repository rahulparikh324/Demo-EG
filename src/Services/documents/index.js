import URL from 'Constants/apiUrls'
import api from 'Services/api-call'

const document = {
  get: payload => api(`${URL.document.get}`, payload, true),
  delete: payload => api(`${URL.document.delete}`, payload, true),
  upload: payload => api(`${URL.document.upload}`, payload, true),
}

export default document
