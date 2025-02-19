import dashboardOutstandingIssueList from '../../Services/Dashboard/dashboardOutstandingIssueService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import $ from 'jquery'
import _ from 'lodash'
import enums from '../../Constants/enums'

export default function dashboardOutstandingIssueListAction() {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({}, tostMsg))

    dashboardOutstandingIssueList()
      .then(response => {
        $('#pageLoading').hide()
        if (response.data.success > 0) {
          dispatch(success(response.data.data, tostMsg))
        } else {
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
  function request(outstandingIssueList, tostMsg) {
    return { type: userConstants.OUTSTANDING_ISSUE_LIST_REQUEST, outstandingIssueList, tostMsg }
  }
  function success(outstandingIssueList, tostMsg) {
    return { type: userConstants.OUTSTANDING_ISSUE_LIST_SUCCESS, outstandingIssueList, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.OUTSTANDING_ISSUE_LIST_FAILURE, error, tostMsg }
  }
}
