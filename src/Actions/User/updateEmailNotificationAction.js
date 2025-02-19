import updateEmailNotification from '../../Services/User/updateEmailNotificationService'
import userConstants from '../../Constants/userConstants'
import $ from 'jquery'
import _ from 'lodash'
import enums from '../../Constants/enums'

export default function updateEmailNotificationAction(urlParameters, status) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({}, tostMsg))
    updateEmailNotification(urlParameters)
      .then(response => {
        $('#pageLoading').hide()
        if (response.data.success > 0) {
          localStorage.setItem('emailNotificationPendingReviews', status)
          tostMsg.msg = enums.resMessages.emailNotificationSuccess
          tostMsg.type = enums.toastMsgType[0].id
          dispatch(success(response.data.data, tostMsg))
        } else {
          tostMsg.msg = enums.resMessages.emailNotificationError
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
  function request(updateEmialNotification, tostMsg) {
    return { type: userConstants.UPDATE_EMAIL_NOTIFICATION_REQUEST, updateEmialNotification, tostMsg }
  }
  function success(updateEmialNotification, tostMsg) {
    return { type: userConstants.UPDATE_EMAIL_NOTIFICATION_SUCCESS, updateEmialNotification, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.UPDATE_EMAIL_NOTIFICATION_FAILURE, error, tostMsg }
  }
}
