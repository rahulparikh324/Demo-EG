import userConstants from '../../Constants/userConstants'

export default function inspectionDetailReducer(state = {}, action) {
  switch (action.type) {
    case userConstants.INSPECTIONDETAIL_REQUEST:
      return {
        loading: true,
        inspectionDetail: action,
        tostMsg: action.tostMsg,
      }
    case userConstants.INSPECTIONDETAIL_SUCCESS:
      return {
        loading: false,
        inspectionDetail: action.inspectionDetail,
        tostMsg: action.tostMsg,
      }

    case userConstants.INSPECTIONDETAIL_FAILURE:
      return {
        loading: false,
        error: action,
        tostMsg: action.tostMsg,
      }
    default:
      return state
  }
}
