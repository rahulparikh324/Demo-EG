import workOrderDetail from '../../Services/WorkOrder/workOrderDetailService'
import userConstants from '../../Constants/userConstants'
import enums from '../../Constants/enums'
import { alert } from '../../components/alertMessage'
import $ from 'jquery'

export default function workOrderDetailAction(uuid, workOrderId) {
  var tostMsg = { msg: '', type: '' }

  return dispatch => {
    dispatch(request({}, tostMsg))

    workOrderDetail(uuid, workOrderId)
      .then(response => {
        $('#pageLoading').hide()

        if (response.data.success > 0) {
          dispatch(success(response.data.data, tostMsg))
        } else {
          // alert.errorMessage(response.data.message);
          tostMsg.msg = response.data.message
          tostMsg.type = enums.toastMsgType[1].id
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
  function request(workOrderDetail, tostMsg) {
    return { type: userConstants.WORKORDERDETAIL_REQUEST, workOrderDetail, tostMsg }
  }
  function success(workOrderDetail, tostMsg) {
    return { type: userConstants.WORKORDERDETAIL_SUCCESS, workOrderDetail, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.WORKORDERDETAIL_FAILURE, error, tostMsg }
  }
}
