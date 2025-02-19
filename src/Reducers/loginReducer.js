import userConstants from '../Constants/userConstants'

export default function loginReducer(state = { loading: true, isAuthenticated: false, loginData: {} }, action) {
  switch (action.type) {
    case userConstants.LOGIN_REQUEST:
      return {
        loading: true,
        isAuthenticated: false,
        loginData: {},
        tostMsg: action.tostMsg,
      }
    case userConstants.LOGIN_SUCCESS:
      return {
        loading: false,
        isAuthenticated: action.loginData.data.success > 0 ? true : false,
        loginData: action.loginData.data,
        tostMsg: action.tostMsg,
      }

    case userConstants.LOGIN_FAILURE:
      return {
        loading: false,
        isAuthenticated: false,
        error: action,
        tostMsg: action.tostMsg,
      }
    default:
      return state
  }
}
