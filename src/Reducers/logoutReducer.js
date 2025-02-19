import userConstants from '../Constants/userConstants'
import _ from 'lodash'
import enums from '../Constants/enums'

export default function logoutReducer(state = {}, action) {
  switch (action.type) {
    case userConstants.LOGOUT_REQUEST:
      return {
        loading: true,
        logoutData: {},
        tostMsg: action.tostMsg,
      }
    case userConstants.LOGOUT_SUCCESS:
      return {
        loading: false,
        logoutData: action.logoutData,
        tostMsg: action.tostMsg,
      }

    case userConstants.LOGOUT_FAILURE:
      return {
        loading: false,
        error: action,
        tostMsg: action.tostMsg,
      }

    default:
      return state
  }
}
