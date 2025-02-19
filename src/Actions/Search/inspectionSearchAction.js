import inspectionSearchList from '../../Services/Search/inspectionSearchService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import $ from 'jquery'
import enums from '../../Constants/enums'

export default function inspectionSearchListAction(urlParamerter, pageIndex) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({}, tostMsg))
    inspectionSearchList(urlParamerter)
      .then(response => {
        $('#pageLoading').hide()
        if (response.data.success > 0) {
          var searchString = urlParamerter.split('/')

          dispatch(success(response.data.data, searchString[1], tostMsg))
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
    return { type: userConstants.INSPECTIONLIST_SEARCH_REQUEST, inspectionList, tostMsg }
  }
  function success(inspectionList, searchString, tostMsg) {
    return { type: userConstants.INSPECTIONLIST_SEARCH_SUCCESS, pageIndex, inspectionList, searchString, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.INSPECTIONLIST_SEARCH_FAILURE, error, tostMsg }
  }
}
