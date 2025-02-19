import updateUserProfile from '../../Services/User/updateProfileService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import $ from 'jquery'
import enums from '../../Constants/enums'
import { history } from '../../helpers/history'

export default function updateUserProfileAction(requestData) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({}, tostMsg))
    updateUserProfile(requestData)
      .then(response => {
        $('#pageLoading').hide()
        if (response.data.success > 0) {
          tostMsg.msg = enums.resMessages.updateProfile
          tostMsg.type = enums.toastMsgType[0].id

          dispatch(success(response.data.data, tostMsg))

          // alert.successMessage(enums.resMessages.updateProfile);
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
    return { type: userConstants.UPDATE_USER_PROFILE_REQUEST, updateUser, tostMsg }
  }
  function success(updateUser, tostMsg) {
    return { type: userConstants.UPDATE_USER_PROFILE_SUCCESS, updateUser, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.UPDATE_USER_PROFILE_FAILURE, error, tostMsg }
  }
}
