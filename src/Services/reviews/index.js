import URL from 'Constants/apiUrls'
import api from 'Services/api-call'

const reviews = {
  submittedAssetsCount: () => api(`${URL.submittedAssetsCount}`),
  getAssetsForSubmittedFilterOptionsByStatus: payload => api(`${URL.getAssetsForSubmittedFilterOptionsByStatus}`, payload, true),
  getWorkOrdersForSubmittedFilterOptionsByStatus: payload => api(`${URL.getWorkOrdersForSubmittedFilterOptionsByStatus}`, payload, true),
  getAllNetaInspectionBulkReportTrackingList: payload => api(`${URL.getAllNetaInspectionBulkReportTrackingList}`, payload, true),
}

export default reviews
