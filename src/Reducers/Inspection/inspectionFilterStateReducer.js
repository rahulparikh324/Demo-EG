import userConstants from '../../Constants/userConstants'

export default function inspectionFilterStateReducer(state = {}, action) {
  switch (action.type) {
    case userConstants.UPDATE_INSPECTION_FILTER_STATE:
      return {
        ...state,
        inspectionFilters: action.payload,
      }
    default:
      return state
  }
}
