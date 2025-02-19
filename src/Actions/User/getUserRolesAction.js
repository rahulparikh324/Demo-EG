import getUserRoles from '../../Services/User/getUserRolesService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import $ from 'jquery'
import _ from 'lodash'
import enums from '../../Constants/enums'

export default function getUserRolesAction(urlPrameters) {
  return dispatch => {
    dispatch(request({}))
    getUserRoles(urlPrameters)
      .then(response => {
        $('#pageLoading').hide()
        if (response.data.success > 0) {
          dispatch(success(response.data.data.list))
          localStorage.setItem('UserRoles', JSON.stringify(response.data.data.list))
        } else {
          // alert.errorMessage(response.data.message);
          dispatch(failure(response))
        }
      })
      .catch(error => {
        $('#pageLoading').hide()
        dispatch(failure(error))
      })
  }
  function request(userRoles) {
    return { type: userConstants.GET_USER_ROLES_REQUEST, userRoles }
  }
  function success(userRoles) {
    return { type: userConstants.GET_USER_ROLES_SUCCESS, userRoles }
  }
  function failure(error) {
    return { type: userConstants.GET_USER_ROLES_FAILURE, error }
  }
}
