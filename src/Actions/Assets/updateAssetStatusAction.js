import updateAssetStatus from '../../Services/Asset/updateAssetStatusService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import $ from 'jquery'
import enums from '../../Constants/enums'
import { history } from '../../helpers/history'

export default function updateAssetStatusAction(requestData) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({}, tostMsg))
    updateAssetStatus(requestData)
      .then(response => {
        $('#pageLoading').hide()
        if (response.data.success > 0) {
          response.data['requestData'] = requestData
          dispatch(success(response.data, tostMsg))
        } else {
          // alert.errorMessage(response.data.message);

          tostMsg.msg = response.data.message
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
  function request(updateAssetStatus, tostMsg) {
    return { type: userConstants.UPDATE_ASSET_STATUS_REQUEST, updateAssetStatus, tostMsg }
  }
  function success(updateAssetStatus, tostMsg) {
    return { type: userConstants.UPDATE_ASSET_STATUS_SUCCESS, updateAssetStatus, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.UPDATE_ASSET_STATUS_FAILURE, error, tostMsg }
  }
}
