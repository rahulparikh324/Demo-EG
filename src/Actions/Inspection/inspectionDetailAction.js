import inspectionDetail from '../../Services/Inspection/inspectionDetailService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import $ from 'jquery'
import enums from '../../Constants/enums'

export default function inspectionDetailAction(inspectionId, userId) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({}, tostMsg))
    inspectionDetail(inspectionId, userId)
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
  function request(inspectionDetail, tostMsg) {
    return { type: userConstants.INSPECTIONDETAIL_REQUEST, inspectionDetail, tostMsg }
  }
  function success(inspectionDetail, tostMsg) {
    return { type: userConstants.INSPECTIONDETAIL_SUCCESS, inspectionDetail, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.INSPECTIONDETAIL_FAILURE, error, tostMsg }
  }
}
