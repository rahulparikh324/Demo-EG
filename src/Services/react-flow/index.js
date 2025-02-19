import URL from 'Constants/apiUrls'
import api from 'Services/api-call'

const reactFLow = {
  get: () => api(`${URL.reactFlow.get}`),
  updatePosition: payload => api(`${URL.reactFlow.updatePosition}`, payload, true),
}

export default reactFLow
