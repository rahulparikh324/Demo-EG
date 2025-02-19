import generateBarcodeUser from '../../Services/User/generateBarcodeUserService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import enums from '../../Constants/enums'
import $ from 'jquery'
import { saveAs } from 'file-saver'

export default function generateBarcodeUserAction(requestData) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({ requestData }, tostMsg))
    generateBarcodeUser(requestData)
      .then(response => {
        dispatch(success(response, tostMsg))
        //console.log(response)
        var blob = new Blob([response.data], { type: 'application/pdf' })
        saveAs(blob, 'userlist.pdf')
        $('#pageLoading').hide()
      })
      .catch(error => {
        $('#pageLoading').hide()
        tostMsg.msg = error
        tostMsg.type = enums.toastMsgType[1].id
        dispatch(failure(error, tostMsg))
      })
  }
  function request(generateBarcodeUser, tostMsg) {
    return { type: userConstants.GENERATE_BARCODE_USER_REQUEST, generateBarcodeUser, tostMsg }
  }
  function success(generateBarcodeUser, tostMsg) {
    return { type: userConstants.GENERATE_BARCODE_USER_SUCCESS, generateBarcodeUser, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.GENERATE_BARCODE_USER_FAILURE, error, tostMsg }
  }
}
