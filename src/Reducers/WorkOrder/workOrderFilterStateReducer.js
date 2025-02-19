import userConstants from '../../Constants/userConstants'

export default function workOrderFilterStateReducer(state = {}, action) {
  switch (action.type) {
    case userConstants.UPDATE_WORKORDER_FILTER_STATE:
      return {
        ...state,
        workOrderFilters: action.payload,
      }
    default:
      return state
  }
}
