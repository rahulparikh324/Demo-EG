import getuserDetail from '../../Services/User/getUserDetailsService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import $ from 'jquery'
import _ from 'lodash'
import enums from '../../Constants/enums'

export default function getUserDetailAction(urlprameters) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({}, tostMsg))
    getuserDetail(urlprameters)
      .then(response => {
        $('#pageLoading').hide()
        if (response.data.success > 0) {
          dispatch(success(response.data.data, tostMsg))
        } else {
          // alert.errorMessage(response.data.message);
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
    return { type: userConstants.USER_DETAIL_REQUEST, userDetail, tostMsg }
  }
  function success(userDetail, tostMsg) {
    return { type: userConstants.USER_DETAIL_SUCCESS, userDetail, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.USER_DETAIL_FAILURE, error, tostMsg }
  }
}
