import dashboardList from '../../Services/Dashboard/dashboardService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import $ from 'jquery'
import _ from 'lodash'
import enums from '../../Constants/enums'

export default function dashboardListAction(userId) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({}, tostMsg))

    dashboardList(userId)
      .then(response => {
        // dispatch(success(response));
        $('#pageLoading').hide()

        if (response.data.success > 0) {
          dispatch(success(response.data.data, tostMsg))
        } else {
          // tostMsg.msg=response.data.message
          // tostMsg.type = enums.toastMsgType[1].id

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
  function request(dashboardList, tostMsg) {
    return { type: userConstants.DASHBOARDLIST_REQUEST, dashboardList, tostMsg }
  }
  function success(dashboardList, tostMsg) {
    return { type: userConstants.DASHBOARDLIST_SUCCESS, dashboardList, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.DASHBOARDLIST_FAILURE, error, tostMsg }
  }
}
