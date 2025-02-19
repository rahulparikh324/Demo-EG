import getAllCompany from '../Services/getAllCompany'
import userConstants from '../Constants/userConstants'
import { alert } from '../components/alertMessage'
import $ from 'jquery'
import _ from 'lodash'
import enums from '../Constants/enums'

export default function getAllCompanyListAction() {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({}, tostMsg))
    getAllCompany()
      .then(response => {
        $('#pageLoading').hide()
        if (response.data.success > 0) {
          dispatch(success(response.data.data, tostMsg))
          localStorage.setItem('AllCompany', JSON.stringify(response.data.data))
        } else {
          // alert.errorMessage(response.data.message);

          tostMsg.msg = response.data.message
          tostMsg.type = enums.toastMsgType[1].id
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
  function request(companyList, tostMsg) {
    return { type: userConstants.GETALLCOMPANY_REQUEST, companyList, tostMsg }
  }
  function success(companyList, tostMsg) {
    return { type: userConstants.GETALLCOMPANY_SUCCESS, companyList, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.GETALLCOMPANY_FAILURE, error, tostMsg }
  }
}
