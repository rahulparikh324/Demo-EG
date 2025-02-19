import userConstants from '../../Constants/userConstants'

export default function ValidateAssetIdReducer(state = {}, action) {
  switch (action.type) {
    case userConstants.VALIDATE_ASSET_REQUEST:
      return {
        loading: true,
        isValidAsset: {},
        tostMsg: action.tostMsg,
      }
    case userConstants.VALIDATE_ASSET_SUCCESS:
      return {
        loading: false,
        isValidAsset: action.isValidAsset,
        tostMsg: action.tostMsg,
      }

    case userConstants.VALIDATE_ASSET_FAILURE:
      return {
        loading: false,
        error: action,
        tostMsg: action.tostMsg,
      }
    default:
      return state
  }
}
