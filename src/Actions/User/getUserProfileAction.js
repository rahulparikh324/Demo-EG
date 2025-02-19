import getUserProfile from '../../Services/User/getUserProfileService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import $ from 'jquery'
import _ from 'lodash'
import enums from '../../Constants/enums'

export default function getUserProfileAction(urlprameters) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({}, tostMsg))
    getUserProfile(urlprameters)
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
  function request(userDetail, tostMsg) {
    return { type: userConstants.USER_DETAIL_PROFILE_REQUEST, userDetail, tostMsg }
  }
  function success(userDetail, tostMsg) {
    return { type: userConstants.USER_DETAIL_PROFILE_SUCCESS, userDetail, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.USER_DETAIL_PROFILE_FAILURE, error, tostMsg }
  }
}
