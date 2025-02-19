import userConstants from '../../Constants/userConstants'
import enums from '../../Constants/enums'
import _ from 'lodash'

export default function dashboardOutstandingIssueListReducer(state = {}, action) {
  //console.log("Dashboard out standing list reducer----------");
  //console.log("state------------", state);
  //console.log("action-----------", action);

  switch (action.type) {
    // OUTSTANDING ISSUE REPORT
    case userConstants.OUTSTANDING_ISSUE_LIST_REQUEST:
      return {
        ...state,
        loading: true,
        outstandingIssueList: {},
        tostMsg: action.tostMsg,
      }
    case userConstants.OUTSTANDING_ISSUE_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        outstandingIssueList: action.outstandingIssueList,
        tostMsg: action.tostMsg,
      }

    case userConstants.OUTSTANDING_ISSUE_LIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action,
        tostMsg: action.tostMsg,
      }
    default:
      return state
  }
}
