import uploadInspectionForm from '../../Services/Inspection/uploadInspectionFormsService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import enums from '../../Constants/enums'
import $ from 'jquery'
export default function uploadInspectionFormAction(requestData) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({ requestData }, tostMsg))
    uploadInspectionForm(requestData)
      .then(response => {
        $('#pageLoading').hide()
        if (response.data.success > 0) {
          // alert.successMessage(enums.resMessages.uploadInspectionForms);
          tostMsg.msg = enums.resMessages.uploadInspectionForms
          tostMsg.type = enums.toastMsgType[0].id
          dispatch(success(response.data, tostMsg))
          // setTimeout(() => {
          //     window.location.replace('../assets');
          // }, 1000);
        } else {
          // alert.errorMessage(response.data.message);
          tostMsg.msg = response.data.message
          tostMsg.type = enums.toastMsgType[1].id
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
  function request(uploadInspection, tostMsg) {
    return { type: userConstants.UPLOAD_INSPECTIONFORMS_REQUEST, uploadInspection, tostMsg }
  }
  function success(uploadInspection, tostMsg) {
    return { type: userConstants.UPLOAD_INSPECTIONFORMS_SUCCESS, uploadInspection, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.UPLOAD_INSPECTIONFORMS_FAILURE, error, tostMsg }
  }
}
