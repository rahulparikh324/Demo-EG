import workOrderSearchList from '../../Services/Search/workOrderSearchByAssetIdService'
import userConstants from '../../Constants/userConstants'
import enums from '../../Constants/enums'
import { alert } from '../../components/alertMessage'
import $ from 'jquery'

export default function workOrderSearchListAction(urlParamerter, pageIndex) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({}, tostMsg))
    workOrderSearchList(urlParamerter)
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
  function request(workOrderList, tostMsg) {
    return { type: userConstants.ASSET_WORKORDER_SEARCH_LIST_REQUEST, workOrderList, tostMsg }
  }
  function success(workOrderList, tostMsg) {
    return { type: userConstants.ASSET_WORKORDER_SEARCH_LIST_SUCCESS, pageIndex, workOrderList, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.ASSET_WORKORDER_SEARCH_LIST_FAILURE, error, tostMsg }
  }
}
