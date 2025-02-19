import userConstants from '../../Constants/userConstants'
import enums from '../../Constants/enums'
import _ from 'lodash'

export default function dashboardListReducer(state = {}, action) {
  //console.log("Dashboard list reducer----------");
  //console.log("state------------", state);
  //console.log("action-----------", action);
  var tostmsg = _.get(state, ['tostMsg'], {})
  switch (action.type) {
    case userConstants.DASHBOARDLIST_REQUEST:
      return {
        ...state,
        loading: true,
        dashboardList: _.get(state, ['dashboardList'], {}),
        outstandingIssueList: _.get(state, ['outstandingIssueList'], {}),
        tostMsg: tostmsg,
      }
    case userConstants.DASHBOARDLIST_SUCCESS:
      return {
        ...state,
        loading: false,
        dashboardList: action.dashboardList,
        outstandingIssueList: _.get(state, ['outstandingIssueList'], {}),
        tostMsg: tostmsg,
      }

    case userConstants.DASHBOARDLIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action,
        tostMsg: tostmsg,
      }

    //Otstanding Issue
    case userConstants.OUTSTANDING_ISSUE_LIST_REQUEST:
      return {
        ...state,
        loading: true,
        dashboardList: _.get(state, ['dashboardList'], {}),
        outstandingIssueList: _.get(state, ['outstandingIssueList'], {}),
        tostMsg: tostmsg,
        isReturnFromOutstanding: false,
      }
    case userConstants.OUTSTANDING_ISSUE_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        dashboardList: _.get(state, ['dashboardList'], {}),
        outstandingIssueList: action.outstandingIssueList,
        tostMsg: tostmsg,
        isReturnFromOutstanding: true,
      }

    case userConstants.OUTSTANDING_ISSUE_LIST_FAILURE:
      return {
        ...state,
        loading: false,
        dashboardList: _.get(state, ['dashboardList'], {}),
        error: action,
        tostMsg: tostmsg,
        isReturnFromOutstanding: false,
      }

    //Approve Inspection
    case userConstants.APPROVEINAPECTION_REQUEST:
      return {
        ...state,
        loading: true,
        dashboardList: {
          checkOutAssets: _.get(state, ['dashboardList', 'checkOutAssets'], []),
          pendingInspection: _.get(state, ['dashboardList', 'pendingInspection'], []),
        },
        outstandingIssueList: _.get(state, ['outstandingIssueList'], {}),
        tostMsg: action.tostMsg,
      }

    case userConstants.APPROVEINAPECTION_SUCCESS:
      let pendingInspectionList = _.get(state, ['dashboardList', 'pendingInspection'], [])
      let checkOutAssets = _.get(state, ['dashboardList', 'checkOutAssets'], [])
      pendingInspectionList.map((value, key) => {
        if (value.inspection_id == action.approveInspection.inspectionId) {
          checkOutAssets = _.concat(checkOutAssets, pendingInspectionList[key])
          pendingInspectionList = pendingInspectionList.splice(key, 1)
          return {
            loading: false,
            ...state,
            dashboardList: {
              checkOutAssets: checkOutAssets,
              pendingInspection: pendingInspectionList,
            },
            outstandingIssueList: _.get(state, ['outstandingIssueList'], {}),
            tostMsg: action.tostMsg,
          }
        }
      })

    case userConstants.APPROVEINAPECTION_FAILURE:
      return {
        loading: false,
        error: action,
        tostMsg: action.tostMsg,
        ...state,
      }
    case 'CLEAR_TOAST_MSG':
      //console.log("CLEAR_TOAST_MSG call");
      return {
        loading: false,
        dashboardList: _.get(state, ['dashboardList'], {}),
        outstandingIssueList: _.get(state, ['outstandingIssueList'], {}),
        tostMsg: {},
      }

    default:
      return state
  }
}
