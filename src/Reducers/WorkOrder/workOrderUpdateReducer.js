import userConstants from '../../Constants/userConstants'

export default function workOrderUpdateReducer(state = {}, action) {
  //console.log("in create-----------",action);
  switch (action.type) {
    case userConstants.WORKORDERUPDATE_REQUEST:
      return {
        loading: true,
        workOrderData: action,
        tostMsg: action.tostMsg,
      }
    case userConstants.WORKORDERUPDATE_SUCCESS:
      return {
        loading: false,
        workOrderData: action.workOrderUpdate,
        tostMsg: action.tostMsg,
      }

    case userConstants.WORKORDERUPDATE_FAILURE:
      return {
        loading: false,
        error: action,
        tostMsg: action.tostMsg,
      }
    default:
      return state
  }
}
