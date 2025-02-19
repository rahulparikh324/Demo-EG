import workOrderUpdate from '../../Services/WorkOrder/workOrderUpdateService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import $ from 'jquery'
import enums from '../../Constants/enums'
import { history } from '../../helpers/history'

export default function workOrderUpdateAction(requestData) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({}, tostMsg))
    workOrderUpdate(requestData)
      .then(response => {
        $('#pageLoading').hide()
        if (response.data.success > 0) {
          tostMsg.msg = enums.resMessages.UpdateWorkOrder
          tostMsg.type = enums.toastMsgType[0].id

          dispatch(success(response.data.data, tostMsg))

          // alert.successMessage(enums.resMessages.UpdateWorkOrder);

          setTimeout(() => {
            dispatch(success(response.data.data, (tostMsg = { msg: '', type: '' })))
            history.push('../workorders')

            // window.location.replace('../workorders');
          }, 1000)
        } else {
          tostMsg.msg = response.data.message
          tostMsg.type = enums.toastMsgType[1].id
          dispatch(failure(response, tostMsg))
          // alert.errorMessage(response.data.message);
        }
      })
      .catch(error => {
        $('#pageLoading').hide()
        tostMsg.msg = error
        tostMsg.type = enums.toastMsgType[1].id
        dispatch(failure(error, tostMsg))
      })
  }
  function request(workOrderUpdate, tostMsg) {
    return { type: userConstants.WORKORDERUPDATE_REQUEST, workOrderUpdate, tostMsg }
  }
  function success(workOrderUpdate, tostMsg) {
    return { type: userConstants.WORKORDERUPDATE_SUCCESS, workOrderUpdate, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.WORKORDERCREATE_FAILURE, error, tostMsg }
  }
}
