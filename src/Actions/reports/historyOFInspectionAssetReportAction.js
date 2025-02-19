import historyOfInspectionAssetReport from '../../Services/Reports/historyOfInspectionAssetReportService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import $ from 'jquery'
import _ from 'lodash'
import enums from '../../Constants/enums'

export default function historyOFInspectionAssetReportAction(urlParameters, pageIndex) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({}, tostMsg))
    historyOfInspectionAssetReport(urlParameters)
      .then(response => {
        $('#pageLoading').hide()
        if (response.data.success > 0) {
          dispatch(success(response.data.data, tostMsg))
        } else {
          // alert.errorMessage(response.data.message);
          dispatch(failure(response, tostMsg))
        }
      })
      .catch(error => {
        $('#pageLoading').hide()
        tostMsg.msg = error
        tostMsg.type = enums.toastMsgType[1].id
        dispatch(failure(error, tostMsg))
      })
  }
  function request(reportList, tostMsg) {
    return { type: userConstants.HISTORY_OF_INSPECTION_ASSET_REPORT_REQUEST, reportList, tostMsg }
  }
  function success(reportList, tostMsg) {
    return { type: userConstants.HISTORY_OF_INSPECTION_ASSET_REPORT_SUCCESS, pageIndex, reportList, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.HISTORY_OF_INSPECTION_ASSET_REPORT_FAILURE, error, tostMsg }
  }
}
