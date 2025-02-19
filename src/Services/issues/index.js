import URL from 'Constants/apiUrls'
import api from 'Services/api-call'

const issues = {
  getList: payload => api(`${URL.issues.getList}`, payload, true),
  getAllTempIssues: payload => api(`${URL.issues.getAllTempIssues}`, payload, true),
  getAllIssuesByWorkorder: payload => api(`${URL.issues.getAllIssuesByWorkorder}`, payload, true),
  addUpdate: payload => api(`${URL.issues.addUpdate}`, payload, true),
  getDetailById: id => api(`${URL.issues.getDetailsById}/${id}`),
  addComment: payload => api(`${URL.issues.addComment}`, payload, true),
  getComments: payload => api(`${URL.issues.getComment}`, payload, true),
  uploadPhoto: payload => api(`${URL.issues.uploadImage}`, payload, true),
  delete: payload => api(`${URL.issues.delete}`, payload, true),
  getLinkedIssues: payload => api(`${URL.issues.getLinkedIssues}`, payload, true),
  getIssuesToLink: payload => api(`${URL.issues.getIssuesToLink}`, payload, true),
  linkIssueToWorkOrder: payload => api(`${URL.issues.linkIssueToWorkOrder}`, payload, true),
  unlinkIssueFromWorkOrder: payload => api(`${URL.issues.unlinkIssueFromWorkOrder}`, payload, true),
  addIssuesDirectlyToMaintenanceWO: payload => api(`${URL.issues.addIssuesDirectlyToMaintenanceWO}`, payload, true),
  linkIssueToWOFromIssueListTab: payload => api(`${URL.issues.linkIssueToWOFromIssueListTab}`, payload, true),
  createTempIssue: payload => api(`${URL.issues.createTempIssue}`, payload, true),
  getAssetList: payload => api(`${URL.issues.getAssetList}`, payload, true),
  multiStep: {
    add: payload => api(`${URL.issues.multiStep.add}`, payload, true),
    view: id => api(`${URL.issues.multiStep.add}/${id}`),
    update: payload => api(`${URL.issues.multiStep.update}`, payload, true),
  },
  getAssetListOptions: payload => api(`Asset/${URL.filterAssetNameOptions}`, payload, true),
  getListOptimized: payload => api(`${URL.issues.getListOptimized}`, payload, true),
  getIssuesByWorkorder: payload => api(`${URL.issues.getIssuesByWorkorder}`, payload, true),
  getSiteIssueReport: id => api(`${URL.issues.downloadSiteIssueReport}/${id}`),
}

export default issues
