import userConstants from '../../Constants/userConstants'

export default function uploadAssetReducer(state = { loading: true, uploadAsset: {} }, action) {
  //console.log("uploadAssetReducer ------------------",action)
  switch (action.type) {
    case userConstants.UPLOAD_ASSET_REQUEST:
      return {
        loading: true,
        uploadAsset: action,
        tostMsg: action.tostMsg,
      }
    case userConstants.UPLOAD_ASSET_SUCCESS:
      return {
        loading: false,
        uploadAsset: action,
        tostMsg: action.tostMsg,
      }

    case userConstants.UPLOAD_ASSET_FAILURE:
      return {
        loading: false,
        error: action,
        tostMsg: action.tostMsg,
      }

    // GET ALL COMPANY CASES
    case userConstants.GETALLCOMPANY_REQUEST:
      return {
        loading: true,
        companyList: action,
        tostMsg: action.tostMsg,
      }
    case userConstants.GETALLCOMPANY_SUCCESS:
      return {
        loading: false,
        companyList: action.companyList,
        tostMsg: action.tostMsg,
      }

    case userConstants.GETALLCOMPANY_FAILURE:
      return {
        loading: false,
        error: action,
        tostMsg: action.tostMsg,
      }

    default:
      return state
  }
}
