import URL from 'Constants/apiUrls'
import api from 'Services/api-call'

const facilities = {
  company: {
    get: payload => api(`${URL.facilities.company.getAll}`, payload, true),
    create: payload => api(`${URL.facilities.company.create}`, payload, true),
  },
  site: {
    create: payload => api(`${URL.facilities.site.create}`, payload, true),
    uploadPhoto: payload => api(`${URL.facilities.site.uploadPhoto}`, payload, true),
  },
  getUserSitesAndRoles: id => api(`${URL.facilities.getUserSitesAndRoles}/${id}`),
}

export default facilities
