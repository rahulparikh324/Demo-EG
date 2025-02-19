import inspectionList from '../../Services/Inspection/inspectionListService'
import userConstants from '../../Constants/userConstants'
import enums from '../../Constants/enums'
import { alert } from '../../components/alertMessage'
import $ from 'jquery'

export default function inspectionListAction(urlParameters, pageIndex) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({}, tostMsg))
    inspectionList(urlParameters)
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
    return { type: userConstants.INSPECTIONLIST_REQUEST, inspectionList, tostMsg }
  }
  function success(inspectionList, tostMsg) {
    return { type: userConstants.INSPECTIONLIST_SUCCESS, pageIndex, inspectionList, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.INSPECTIONLIST_FAILURE, error, tostMsg }
  }
}
