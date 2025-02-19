import workOrderSearchList from '../../Services/Search/workOrderSearchService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import $ from 'jquery'
import enums from '../../Constants/enums'

export default function workOrderSearchListAction(urlParamerter, pageIndex) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({}, tostMsg))
    workOrderSearchList(urlParamerter)
      .then(response => {
        $('#pageLoading').hide()
        if (response.data.success > 0) {
          var searchString = urlParamerter.split('/')

          dispatch(success(response.data.data, searchString[1], tostMsg))
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
  function request(workOrderList, tostMsg) {
    return { type: userConstants.WORKORDERLIST_SEARCH_REQUEST, workOrderList, tostMsg }
  }
  function success(workOrderList, searchString, tostMsg) {
    return { type: userConstants.WORKORDERLIST_SEARCH_SUCCESS, pageIndex, workOrderList, searchString, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.WORKORDERLIST_SEARCH_FAILURE, error, tostMsg }
  }
}
