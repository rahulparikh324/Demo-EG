import GenerateReport2List from '../../Services/Reports/generateReport2ListService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import $ from 'jquery'
import _ from 'lodash'
import enums from '../../Constants/enums'

export default function GenerateReport2ListAction(urlParameters) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({}, tostMsg))
    GenerateReport2List(urlParameters)
      .then(response => {
        $('#pageLoading').hide()
        if (response.data.success > 0) {
          dispatch(success(response.data.data.list, tostMsg))
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
    return { type: userConstants.GENERATE_REPORT_2_LIST_REQUEST, reportList, tostMsg }
  }
  function success(reportList, tostMsg) {
    return { type: userConstants.GENERATE_REPORT_2_LIST_SUCCESS, reportList, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.GENERATE_REPORT_2_LIST_FAILURE, error, tostMsg }
  }
}
