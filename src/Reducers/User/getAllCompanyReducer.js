import userConstants from '../../Constants/userConstants'

export default function getAllCompanyReducer(state = { loading: true, companyList: {} }, action) {
  switch (action.type) {
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
