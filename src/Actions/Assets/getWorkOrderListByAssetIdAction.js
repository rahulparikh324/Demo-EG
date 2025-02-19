import workOrderList from '../../Services/Asset/getWorkOrderlistByAssetIdService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import $ from 'jquery'
import _ from 'lodash'
import enums from '../../Constants/enums'

export default function workOrderListAction(urlParamerter, pageIndex) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({}, tostMsg))
    workOrderList(urlParamerter)
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
    return { type: userConstants.ASSET_WORKORDER_LIST_REQUEST, workOrderList, tostMsg }
  }
  function success(workOrderList, tostMsg) {
    return { type: userConstants.ASSET_WORKORDER_LIST_SUCCESS, pageIndex, workOrderList, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.ASSET_WORKORDER_LIST_FAILURE, error, tostMsg }
  }
}
