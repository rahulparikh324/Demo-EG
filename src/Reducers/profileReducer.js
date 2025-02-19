import userConstants from '../Constants/userConstants'
import _ from 'lodash'
import enums from '../Constants/enums'

export default function profileReducer(state = {}, action) {
  //console.log("state user-----------", state);
  //console.log("action user----------", action);

  switch (action.type) {
    // GET USER DETAIL CASES
    case userConstants.USER_DETAIL_PROFILE_REQUEST:
      return {
        loading: true,
        userDetail: {},
        tostMsg: action.tostMsg,
      }
    case userConstants.USER_DETAIL_PROFILE_SUCCESS:
      return {
        loading: false,
        userDetail: action.userDetail,
        tostMsg: action.tostMsg,
      }
    case userConstants.USER_DETAIL_PROFILE_FAILURE:
      return {
        loading: false,
        error: action,
        tostMsg: action.tostMsg,
      }

    //Update profile reducer
    case userConstants.UPDATE_USER_PROFILE_REQUEST:
      return {
        loading: true,
        updateUser: {},
        tostMsg: action.tostMsg,
      }
    case userConstants.UPDATE_USER_PROFILE_SUCCESS:
      return {
        loading: false,
        updateUser: action.updateUser,
        tostMsg: action.tostMsg,
      }
    case userConstants.UPDATE_USER_PROFILE_FAILURE:
      return {
        loading: false,
        error: action,
        tostMsg: action.tostMsg,
      }

    //Update email notification
    case userConstants.UPDATE_EMAIL_NOTIFICATION_REQUEST:
      return {
        loading: true,
        updateEmialNotification: {},
        tostMsg: action.tostMsg,
      }
    case userConstants.UPDATE_EMAIL_NOTIFICATION_SUCCESS:
      return {
        loading: false,
        updateEmialNotification: action.updateEmialNotification,
        tostMsg: action.tostMsg,
      }
    case userConstants.UPDATE_EMAIL_NOTIFICATION_FAILURE:
      return {
        loading: false,
        error: action,
        tostMsg: action.tostMsg,
      }

    default:
      return state
  }
}
