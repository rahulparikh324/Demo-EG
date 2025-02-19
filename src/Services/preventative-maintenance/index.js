import URL from 'Constants/apiUrls'
import api from 'Services/api-call'

const preventativeMaintenance = {
  category: {
    getAll: () => api(`${URL.preventativeMaintenance.category.get}`),
  },
  plans: {
    getPlans: ({ id }) => api(`${URL.preventativeMaintenance.plan.get}/${id}`),
    addUpdate: payload => api(`${URL.preventativeMaintenance.plan.addUpdate}`, payload, true),
    delete: ({ id }) => api(`${URL.preventativeMaintenance.plan.delete}/${id}`),
    markDefault: payload => api(`${URL.preventativeMaintenance.plan.markDefault}`, payload, true),
  },
  pm: {
    get: ({ id }) => api(`${URL.preventativeMaintenance.pm.get}/${id}`),
    getById: ({ id }) => api(`${URL.preventativeMaintenance.pm.getById}/${id}`),
    addUpdate: payload => api(`${URL.preventativeMaintenance.pm.addUpdate}`, payload, true),
    delete: ({ id }) => api(`${URL.preventativeMaintenance.pm.delete}/${id}`),
    uploadAttachment: payload => api(`${URL.preventativeMaintenance.pm.uploadAttachment}`, payload, true),
  },
  asset: {
    getPlans: ({ id }) => api(`${URL.preventativeMaintenance.asset.getPlans}/${id}`),
    getAssignedPMs: payload => api(`${URL.preventativeMaintenance.asset.getAssignedPMs}`, payload, true),
    getFilterDropdown: payload => api(`${URL.preventativeMaintenance.asset.getFilterDropdown}`, payload, true),
    addPlan: payload => api(`${URL.preventativeMaintenance.asset.addPlan}`, payload, true),
    removePM: ({ id }) => api(`${URL.preventativeMaintenance.asset.removePM}/${id}`),
    getPM: ({ id }) => api(`${URL.preventativeMaintenance.asset.getPM}/${id}`),
    getMetrics: () => api(`${URL.preventativeMaintenance.asset.getMetrics}`),
    update: payload => api(`${URL.preventativeMaintenance.asset.update}`, payload, false, true),
    markComplete: payload => api(`${URL.preventativeMaintenance.asset.markComplete}`, payload, true),
    exportAssetsLocationDetails: payload => api(`${URL.preventativeMaintenance.asset.exportAssetsLocationDetails}`, payload, true),
    getAssetWise: payload => api(`${URL.preventativeMaintenance.asset.getAssetWise}`, payload, true),
    getPMsByAssetId: payload => api(`${URL.preventativeMaintenance.asset.getPMsByAssetId}`, payload, true),
    getPMsListByAssetClassId: payload => api(`${URL.preventativeMaintenance.asset.getPMsListByAssetClassId}`, payload, true),
    getFilterDropdown: payload => api(`${URL.preventativeMaintenance.asset.getFilterDropdown}`, payload, true),
    bulkCreateWOline: payload => api(`${URL.preventativeMaintenance.asset.bulkCreateWOline}`, payload, true),
    bulkCreateIRPMsWOline: payload => api(`${URL.preventativeMaintenance.asset.bulkCreateIRPMsWOline}`, payload, true),
    assetPMsStatus: payload => api(`${URL.preventativeMaintenance.asset.assetPMsStatus}`, payload, true),
    getAssignedPMsOptimized: payload => api(`${URL.preventativeMaintenance.asset.getAssignedPMsOptimized}`, payload, true),
  },
  workOrder: {
    link: payload => api(`${URL.preventativeMaintenance.workOrder.link}`, payload, true),
    linkToLine: payload => api(`${URL.preventativeMaintenance.workOrder.linkToLine}`, payload, true),
    getAssetPMConditionDataForExport: payload => api(`${URL.preventativeMaintenance.workOrder.getAssetPMConditionDataForExport}`, payload, true),
    addWoLine: payload => api(`${URL.preventativeMaintenance.workOrder.addWoLine}`, payload, true),
    manuallyAssignPm: payload => api(`${URL.preventativeMaintenance.workOrder.manuallyAssignPm}`, payload, true),
    addPmToNewLine: payload => api(`${URL.preventativeMaintenance.workOrder.addPmToNewLine}`, payload, true),
  },
  forms: {
    get: ({ id }) => api(`${URL.preventativeMaintenance.forms.get}?pm_id=${id}`),
    // getLine: ({ id }) => api(`${URL.preventativeMaintenance.forms.getLine}?asset_pm_id=${id}`),
    getLine: payload => api(`${URL.preventativeMaintenance.forms.getLine}`, payload, true),
    submit: payload => api(`${URL.preventativeMaintenance.forms.submit}`, payload, true),
    uploadPhoto: payload => api(`${URL.preventativeMaintenance.forms.uploadPhoto}`, payload, true),
  },
  report: {
    exportDuePMsReport: payload => api(`${URL.preventativeMaintenance.report.exportDuePMsReport}`, payload, true),
    bulkUploadLastCompletedPMs: payload => api(`${URL.preventativeMaintenance.report.bulkUploadLastCompletedPMs}`, payload, true),
  },
}

export default preventativeMaintenance
