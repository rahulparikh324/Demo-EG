import searchInUserList from '../../Services/Search/searchInUserListService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import $ from 'jquery'
import _ from 'lodash'
import enums from '../../Constants/enums'

export default function searchInUserListAction(urlParamerter, pageIndex) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({}, tostMsg))
    searchInUserList(urlParamerter)
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
  function request(userList, tostMsg) {
    return { type: userConstants.USER_LIST_SEARCH_REQUEST, userList, tostMsg }
  }
  function success(userList, searchString, tostMsg) {
    return { type: userConstants.USER_LIST_SEARCH_SUCCESS, pageIndex, userList, searchString, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.USER_LIST_SEARCH_FAILURE, error, tostMsg }
  }
}
