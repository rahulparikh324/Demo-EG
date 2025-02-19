import userConstants from '../../Constants/userConstants'

export default function workOrderCreateReducer(state = {}, action) {
  //console.log("in create-----------",action);
  switch (action.type) {
    case userConstants.WORKORDERCREATE_REQUEST:
      return {
        loading: true,
        workOrderData: action,
      }
    case userConstants.WORKORDERCREATE_SUCCESS:
      return {
        loading: false,
        workOrderData: action.workOrderCreate,
      }

    case userConstants.WORKORDERCREATE_FAILURE:
      return {
        loading: false,
        error: action,
      }
    default:
      return state
  }
}
