import userConstants from '../../Constants/userConstants'

export default function generateBarcodeReducer(state = {}, action) {
  switch (action.type) {
    case userConstants.GENERATE_BARCODE_REQUEST:
      return {
        loading: true,
        uploadAsset: action,
        tostMsg: action.tostMsg,
      }
    case userConstants.GENERATE_BARCODE_SUCCESS:
      return {
        loading: false,
        uploadAsset: action,
        tostMsg: action.tostMsg,
      }

    case userConstants.GENERATE_BARCODE_FAILURE:
      return {
        loading: false,
        error: action,
        tostMsg: action.tostMsg,
      }
    default:
      return state
  }
}
