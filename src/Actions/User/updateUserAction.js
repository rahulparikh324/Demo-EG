import updateUser from '../../Services/User/updateUserService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import $ from 'jquery'
import enums from '../../Constants/enums'
import { history } from '../../helpers/history'

export default function updateUserAction(requestData) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({}, tostMsg))
    updateUser(requestData)
      .then(response => {
        $('#pageLoading').hide()
        if (response.data.success > 0) {
          tostMsg.msg = enums.resMessages.updateUser
          tostMsg.type = enums.toastMsgType[0].id

          dispatch(success(response.data.data, tostMsg))

          // alert.successMessage(enums.resMessages.updateUser);

          setTimeout(() => {
            dispatch(success(response.data.data, (tostMsg = { msg: '', type: '' })))
            history.push('../../users')
          }, 1000)
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
  function request(updateUser, tostMsg) {
    return { type: userConstants.UPDATE_USER_REQUEST, updateUser, tostMsg }
  }
  function success(updateUser, tostMsg) {
    return { type: userConstants.UPDATE_USER_SUCCESS, updateUser, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.UPDATE_USER_FAILURE, error, tostMsg }
  }
}
