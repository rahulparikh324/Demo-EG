import userConstants from '../../Constants/userConstants'
import _ from 'lodash'

export default function getUserRolesReducer(state = {}, action) {
  switch (action.type) {
    // GET USER ROLES CASES
    case userConstants.GET_USER_ROLES_REQUEST:
      return {
        loading: true,
        userRoles: [],
        tostMsg: action.tostMsg,
      }
    case userConstants.GET_USER_ROLES_SUCCESS:
      return {
        loading: false,
        userRoles: action.userRoles,
        tostMsg: action.tostMsg,
      }

    case userConstants.GET_USER_ROLES_FAILURE:
      return {
        loading: false,
        error: action,
        userRoles: [],
        tostMsg: action.tostMsg,
      }

    default:
      return state
  }
}
