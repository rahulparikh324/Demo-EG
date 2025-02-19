import inspectionList from '../../Services/Asset/getInspectionByAssetIdService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import $ from 'jquery'
import _ from 'lodash'
import enums from '../../Constants/enums'

export default function inspectionListAction(urlParamerter, pageIndex) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({}, tostMsg))
    inspectionList(urlParamerter)
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
  function request(inspectionList, tostMsg) {
    return { type: userConstants.ASSET_INSPECTION_LIST_REQUEST, inspectionList, tostMsg }
  }
  function success(inspectionList, tostMsg) {
    return { type: userConstants.ASSET_INSPECTION_LIST_SUCCESS, pageIndex, inspectionList, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.ASSET_INSPECTION_LIST_FAILURE, error, tostMsg }
  }
}
