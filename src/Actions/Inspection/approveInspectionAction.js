import approveInspection from '../../Services/Inspection/approveInspectionService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import $ from 'jquery'
import enums from '../../Constants/enums'
import { history } from '../../helpers/history'

export default function approveInspectionAction(requestData, searchString = '', type) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({}, tostMsg))

    approveInspection(requestData)
      .then(response => {
        $('#pageLoading').hide()
        if (response.data.success > 0) {
          response.data['inspectionId'] = requestData.inspection_id
          response.data['searchString'] = searchString

          tostMsg.msg = enums.resMessages.ApproveInspection
          tostMsg.type = enums.toastMsgType[0].id

          dispatch(success(response.data, tostMsg))

          // alert.successMessage(enums.resMessages.ApproveInspection);

          // setTimeout(() => {
          if (type == enums.approveInspectionFromType[1].id) {
            history.push('../../inspections')
          } else {
            history.push('../../dashboard')
          }

          // }, 1000);
        } else {
          tostMsg.msg = response.data.message
          tostMsg.type = enums.toastMsgType[1].id

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
  function request(approveInspection, tostMsg) {
    return { type: userConstants.APPROVEINAPECTION_REQUEST, approveInspection, tostMsg }
  }
  function success(approveInspection, tostMsg) {
    return { type: userConstants.APPROVEINAPECTION_SUCCESS, approveInspection, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.APPROVEINAPECTION_FAILURE, error, tostMsg }
  }
}
