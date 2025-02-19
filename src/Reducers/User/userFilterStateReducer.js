import userConstants from '../../Constants/userConstants'

export default function userFilterStateReducer(state = {}, action) {
  switch (action.type) {
    case userConstants.UPDATE_USER_FILTER_STATE:
      return {
        ...state,
        userFilters: action.payload,
      }
    default:
      return state
  }
}
