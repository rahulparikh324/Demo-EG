import uploadAsset from '../../Services/Asset/uploadAssetService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import enums from '../../Constants/enums'
import $ from 'jquery'
export default function uploadAssetAction(requestData) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({ requestData }, tostMsg))
    uploadAsset(requestData)
      .then(response => {
        //console.log("in action --------------",response.data);
        $('#pageLoading').hide()
        if (response.data.success > 0) {
          // alert.successMessage(enums.resMessages.uploadAsset);
          tostMsg.msg = enums.resMessages.uploadAsset
          tostMsg.type = enums.toastMsgType[0].id

          dispatch(success(response.data, tostMsg))
          setTimeout(() => {
            window.location.replace('../assets')
          }, 1000)
        } else {
          // alert.errorMessage(response.data.message);

          tostMsg.msg = response.data.message
          tostMsg.type = enums.toastMsgType[1].id

          dispatch(failure(response.data, tostMsg))
          // setTimeout(() => {
          //     window.location.replace('../assets');
          // }, 1000);
        }
      })
      .catch(error => {
        $('#pageLoading').hide()

        tostMsg.msg = error
        tostMsg.type = enums.toastMsgType[1].id

        dispatch(failure(error, tostMsg))
      })
  }
  function request(uploadAsset, tostMsg) {
    return { type: userConstants.UPLOAD_ASSET_REQUEST, uploadAsset, tostMsg }
  }
  function success(uploadAsset, tostMsg) {
    return { type: userConstants.UPLOAD_ASSET_SUCCESS, uploadAsset, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.UPLOAD_ASSET_FAILURE, error, tostMsg }
  }
}
