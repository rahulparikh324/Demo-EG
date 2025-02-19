import URL from 'Constants/apiUrls'
import api from 'Services/api-call'

const jobScheduler = {
  getFilterVendorList: payload => api(`${URL.vendor.filteVendoroptimized}`, payload, true),
  addUpdateVendor: payload => api(`${URL.vendor.addUpdateVendor}`, payload, true),
  viewVendorDetailById: id => api(`${URL.vendor.viewVendorDetailById}/${id}`),
  createUpdateContact: payload => api(`${URL.vendor.createUpdateContact}`, payload, true),
  getDropdown: () => api(`${URL.vendor.getDropdown}`),
  getContactsList: payload => api(`${URL.vendor.getContactsList}`, payload, true),
}

export default jobScheduler
