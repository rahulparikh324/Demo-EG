import getAllAssetIdListService from '../../Services/Reports/getAllAssetIdListService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import $ from 'jquery'
import _ from 'lodash'
import enums from '../../Constants/enums'

export default function getAllAssetIdListAction(urlParameters) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({}, tostMsg))
    getAllAssetIdListService(urlParameters)
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
  function request(assetlist, tostMsg) {
    return { type: userConstants.GET_ALL_ASSET_ID_LIST_REQUEST, assetlist, tostMsg }
  }
  function success(assetlist, tostMsg) {
    return { type: userConstants.GET_ALL_ASSET_ID_LIST_SUCCESS, assetlist, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.GET_ALL_ASSET_ID_LIST_FAILURE, error, tostMsg }
  }
}
