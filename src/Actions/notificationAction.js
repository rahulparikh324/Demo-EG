import notificationList from '../Services/getNotificationListService'
import userConstants from '../Constants/userConstants'
import { alert } from '../components/alertMessage'
import $ from 'jquery'
import _ from 'lodash'
import enums from '../Constants/enums'

export default function notificationListAction(urlPrameters, pageIndex) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({}, tostMsg))
    notificationList(urlPrameters)
      .then(response => {
        $('#notificationLoading').hide()
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
        $('#notificationLoading').hide()
        tostMsg.msg = error.data.message
        tostMsg.type = enums.toastMsgType[1].id
        dispatch(failure(error, tostMsg))
      })
  }
  function request(notificationList, tostMsg) {
    return { type: userConstants.NOTIFICATION_LIST_REQUEST, notificationList, tostMsg }
  }
  function success(notificationList, tostMsg) {
    return { type: userConstants.NOTIFICATION_LIST_SUCCESS, pageIndex, notificationList, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.NOTIFICATION_LIST_FAILURE, error, tostMsg }
  }
}
