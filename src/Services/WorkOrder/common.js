import post from '../postService'
import get from '../getService'
import URL from 'Constants/apiUrls'
import { camelizeKeys } from 'helpers/formatters'

const apiCall = async (url, reqData, isPost) => {
  try {
    const res = isPost ? await post(url, reqData) : await get(url)
    return camelizeKeys(res.data)
  } catch (error) {
    return error
  }
}

const workorder = {
  exportAssets: payload => apiCall(`${URL.exportWorkOrderAssets}`, payload, true),
  checkCompletionStatus: id => apiCall(`${URL.genericWorkorder.checkCompletionStatus}/${id}`),
  getFormDataForBulkOpertaion: id => apiCall(`${URL.genericWorkorder.getFormDataForBulkOpertaion}/${id}`),
  getFormDataTemplate: id => apiCall(`${URL.genericWorkorder.getFormDataTemplate}/${id}`),
  bulkImportAssetForm: payload => apiCall(`${URL.genericWorkorder.bulkImportAssetForm}`, payload, true),
  bulkImportAssetFormStatus: id => apiCall(`${URL.genericWorkorder.bulkImportAssetFormStatus}?wo_id=${id}`),
  getIssueWOlineDetailsById: id => apiCall(`${URL.issues.multiStep.view}/${id}`),
  getAssetsWithQRCode: id => apiCall(`${URL.getAssetsWithQRCode}/${id}`),
  exportTempAssetsExport: id => apiCall(`${URL.exportTempAssetsExport}/${id}`),
  getAllCalendarWorkorders: payload => apiCall(URL.genericWorkorder.getAllCalendarWorkorders, payload, true),
}

export default workorder
