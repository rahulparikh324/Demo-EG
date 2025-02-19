import validateAssetIdService from '../../Services/Asset/validateAssetIdService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import $ from 'jquery'
import _ from 'lodash'
import enums from '../../Constants/enums'
export default function assetListAction(urlParameters) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({}, tostMsg))
    validateAssetIdService(urlParameters)
      .then(response => {
        $('#pageLoading').hide()
        dispatch(success(response.data, tostMsg))
        if (response.data.success > 0) {
          dispatch(success(true, tostMsg))
        } else {
          tostMsg.msg = response.data.message
          tostMsg.type = enums.toastMsgType[1].id

          dispatch(success(false, tostMsg))
          // alert.errorMessage(response.data.message);
        }
      })
      .catch(error => {
        $('#pageLoading').hide()
        tostMsg.msg = error
        tostMsg.type = enums.toastMsgType[1].id
        dispatch(failure(error, tostMsg))
      })
  }
  function request(isValidAsset, tostMsg) {
    return { type: userConstants.VALIDATE_ASSET_REQUEST, isValidAsset, tostMsg }
  }
  function success(isValidAsset, tostMsg) {
    return { type: userConstants.VALIDATE_ASSET_SUCCESS, isValidAsset, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.VALIDATE_ASSET_FAILURE, error, tostMsg }
  }
}
