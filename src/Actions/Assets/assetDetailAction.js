import assetDetail from '../../Services/Asset/assetDetailService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import enums from '../../Constants/enums'
import $ from 'jquery'

export default function assetDetailAction(requestData) {
  //console.log("in asset Detail action--------");
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({ requestData }, tostMsg))
    assetDetail(requestData)
      .then(response => {
        $('#pageLoading').hide()
        if (response.data.success > 0) {
          dispatch(success(response.data.data, tostMsg))
        } else {
          // alert.errorMessage(response.data.message);

          // tostMsg.msg=response.data.message
          // tostMsg.type = enums.toastMsgType[1].id

          dispatch(failure(response.data, tostMsg))
        }
      })
      .catch(error => {
        $('#pageLoading').hide()

        tostMsg.msg = error
        tostMsg.type = enums.toastMsgType[1].id

        dispatch(failure(error, tostMsg))
      })
  }
  function request(assetDetail, tostMsg) {
    return { type: userConstants.ASSETDETAIL_REQUEST, assetDetail, tostMsg }
  }
  function success(assetDetail, tostMsg) {
    return { type: userConstants.ASSETDETAIL_SUCCESS, assetDetail, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.ASSETDETAIL_FAILURE, error, tostMsg }
  }
}
