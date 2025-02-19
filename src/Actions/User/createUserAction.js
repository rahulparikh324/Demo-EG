import createUser from '../../Services/User/createUserService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import $ from 'jquery'
import enums from '../../Constants/enums'
import { history } from '../../helpers/history'

export default function createUserAction(requestData) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request({}, tostMsg))
    createUser(requestData)
      .then(response => {
        $('#pageLoading').hide()
        if (response.data.success > 0) {
          tostMsg.msg = enums.resMessages.createUser
          tostMsg.type = enums.toastMsgType[0].id

          dispatch(success(response.data.data, tostMsg))

          // alert.successMessage(enums.resMessages.createUser);
          setTimeout(() => {
            dispatch(success(response.data.data, (tostMsg = { msg: '', type: '' })))
            history.push('../../users')
          }, 1000)
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
  function request(createUser, tostMsg) {
    return { type: userConstants.CREATE_USER_REQUEST, createUser, tostMsg }
  }
  function success(createUser, tostMsg) {
    return { type: userConstants.CREATE_USER_SUCCESS, createUser, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.CREATE_USER_FAILURE, error, tostMsg }
  }
}
