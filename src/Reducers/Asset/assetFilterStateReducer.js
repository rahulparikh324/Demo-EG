import userConstants from '../../Constants/userConstants'

export default function assetFilterStateReducer(state = {}, action) {
  switch (action.type) {
    case userConstants.UPDATE_ASSET_FILTER_STATE:
      return {
        ...state,
        assetFilters: action.payload,
      }
    default:
      return state
  }
}
