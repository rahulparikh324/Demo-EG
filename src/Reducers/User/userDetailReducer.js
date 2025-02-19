import userConstants from '../../Constants/userConstants'
import _ from 'lodash'

export default function userDetailReducer(state = {}, action) {
  switch (action.type) {
    // GET USER DETAIL CASES
    case userConstants.USER_DETAIL_REQUEST:
      return {
        loading: true,
        userDetail: {},
        tostMsg: action.tostMsg,
      }
    case userConstants.USER_DETAIL_SUCCESS:
      return {
        loading: false,
        userDetail: action.userDetail,
        tostMsg: action.tostMsg,
      }

    case userConstants.USER_DETAIL_FAILURE:
      return {
        loading: false,
        error: action,
        tostMsg: action.tostMsg,
      }

    default:
      return state
  }
}
