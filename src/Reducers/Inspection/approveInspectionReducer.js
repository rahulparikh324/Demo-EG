import userConstants from '../../Constants/userConstants'

export default function approveInspectionReducer(state = {}, action) {
  switch (action.type) {
    case userConstants.APPROVEINAPECTION_REQUEST:
      return {
        loading: true,
        inspectionDetail: action,
        tostMsg: action.tostMsg,
      }
    case userConstants.APPROVEINAPECTION_SUCCESS:
      return {
        loading: false,
        inspectionDetail: action,
        tostMsg: action.tostMsg,
      }

    case userConstants.APPROVEINAPECTION_FAILURE:
      return {
        loading: false,
        error: action,
        tostMsg: action.tostMsg,
      }
    default:
      return state
  }
}
