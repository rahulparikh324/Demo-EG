import userConstants from '../../Constants/userConstants'

export default function workOrderDetailReducer(state = {}, action) {
  switch (action.type) {
    case userConstants.WORKORDERDETAIL_REQUEST:
      return {
        loading: true,
        workOrderData: action,
        tostMsg: action.tostMsg,
      }
    case userConstants.WORKORDERDETAIL_SUCCESS:
      return {
        loading: false,
        workOrderData: action.workOrderDetail,
        tostMsg: action.tostMsg,
      }

    case userConstants.WORKORDERDETAIL_FAILURE:
      return {
        loading: false,
        error: action,
        tostMsg: action.tostMsg,
      }
    default:
      return state
  }
}
