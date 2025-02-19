import updateUserStatus from '../../Services/User/updateUserStatusService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import $ from 'jquery'
import enums from '../../Constants/enums'
import { history } from '../../helpers/history'

export default function updateUserStatusAction(requestData) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({}, tostMsg))
    updateUserStatus(requestData)
      .then(response => {
        $('#pageLoading').hide()
        if (response.data.success > 0) {
          response.data['requestData'] = requestData
          dispatch(success(response.data, tostMsg))
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
  function request(updateUserStatus, tostMsg) {
    return { type: userConstants.UPDATE_USER_STATUS_REQUEST, updateUserStatus, tostMsg }
  }
  function success(updateUserStatus, tostMsg) {
    return { type: userConstants.UPDATE_USER_STATUS_SUCCESS, updateUserStatus, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.UPDATE_USER_STATUS_FAILURE, error, tostMsg }
  }
}
