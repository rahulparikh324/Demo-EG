import userConstants from '../../Constants/userConstants'

export default function generateBarcodeUserReducer(state = {}, action) {
  switch (action.type) {
    case userConstants.GENERATE_BARCODE_USER_REQUEST:
      return {
        loading: true,
        downloadBarcode: action,
        tostMsg: action.tostMsg,
      }
    case userConstants.GENERATE_BARCODE_USER_SUCCESS:
      return {
        loading: false,
        downloadBarcode: action,
        tostMsg: action.tostMsg,
      }

    case userConstants.GENERATE_BARCODE_USER_FAILURE:
      return {
        loading: false,
        error: action,
        tostMsg: action.tostMsg,
      }
    default:
      return state
  }
}
