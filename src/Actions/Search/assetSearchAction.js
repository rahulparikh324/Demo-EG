import assetSearchList from '../../Services/Search/assetSearchService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import $ from 'jquery'
import _ from 'lodash'
import enums from '../../Constants/enums'

export default function assetSearchListAction(urlParamerter, pageIndex) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({}, tostMsg))
    assetSearchList(urlParamerter)
      .then(response => {
        $('#pageLoading').hide()
        if (response.data.success > 0) {
          var searchString = urlParamerter.split('/')
          if (!_.isEmpty(response.data.data)) {
            response.data.data.list.map((value, key) => {
              enums.assetStatus.map((value1, key1) => {
                if (value.status == value1.id) {
                  value.statusName = value1.status
                }
              })
            })
          }
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
  function request(assetList, tostMsg) {
    return { type: userConstants.ASSETLIST_SEARCH_REQUEST, assetList, tostMsg }
  }
  function success(assetList, searchString, tostMsg) {
    return { type: userConstants.ASSETLIST_SEARCH_SUCCESS, pageIndex, assetList, searchString, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.ASSETLIST_SEARCH_FAILURE, error, tostMsg }
  }
}
