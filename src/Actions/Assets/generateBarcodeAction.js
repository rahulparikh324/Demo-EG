import generateBarcode from '../../Services/Asset/generateBarcodeService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import enums from '../../Constants/enums'
import $ from 'jquery'
var FileSaver = require('file-saver')

export default function generateBarcodeAction(requestData) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    $('#pageLoading').show()
    dispatch(request({ requestData }, tostMsg))
    generateBarcode(requestData)
      .then(response => {
        dispatch(success(response, tostMsg))
        // if(response.data.success>0){
        //     // //console.log(response.data.message);
        //     // window.open(response.data.message);
        //     dispatch(success(response.data.data));
        //     //console.log("in generate barcode actions--------------");
        //     //console.log(response.data.data);

        //     // alert.successMessage(enums.resMessages.uploadAsset);
        //     // dispatch(success(response.data));
        //     // setTimeout(() => {
        //     //     window.location.replace('../assets');
        //     // }, 1000);
        // }else{
        //     // alert.errorMessage(response.data.message);
        //     dispatch(failure(response.data));
        // }

        // const file = new Blob([response.data],
        // 	{ type: 'application/xxx' });
        // const fileURL = URL.createObjectURL(file);
        //Open the URL on new Window
        //window.open(fileURL);

        var blob = new Blob([response.data], { type: 'application/pdf' })
        FileSaver.saveAs(blob, 'Assetlist.pdf')
        $('#pageLoading').hide()
      })
      .catch(error => {
        $('#pageLoading').hide()
        tostMsg.msg = error
        tostMsg.type = enums.toastMsgType[1].id
        dispatch(failure(error, tostMsg))
      })
  }
  function request(generateBarcode, tostMsg) {
    return { type: userConstants.GENERATE_BARCODE_REQUEST, generateBarcode, tostMsg }
  }
  function success(generateBarcode, tostMsg) {
    return { type: userConstants.GENERATE_BARCODE_SUCCESS, generateBarcode, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.GENERATE_BARCODE_FAILURE, error, tostMsg }
  }
}
