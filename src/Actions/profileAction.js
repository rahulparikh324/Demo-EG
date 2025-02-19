import updateUserProfile from '../Services/profileService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import $ from 'jquery'
import _ from 'lodash'
import enums from '../../Constants/enums'

export default function updateUserProfileAction(urlParameters) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({}, tostMsg))
    updateUserProfile(urlParameters)
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
        tostMsg.msg = error.data.message
        tostMsg.type = enums.toastMsgType[1].id
        dispatch(failure(error, tostMsg))
      })
  }
  function request(userList, tostMsg) {
    return { type: userConstants.USER_LIST_REQUEST, userList, tostMsg }
  }
  function success(userList, tostMsg) {
    return { type: userConstants.USER_LIST_SUCCESS, pageIndex, userList, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.USER_LIST_FAILURE, error, tostMsg }
  }
}
