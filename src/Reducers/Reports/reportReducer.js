import userConstants from '../../Constants/userConstants'
import _ from 'lodash'
import enums from '../../Constants/enums'

export default function reportsReducer(state = {}, action) {
  //console.log("state user-----------", state);
  //console.log("action user----------", action);

  switch (action.type) {
    // report List
    case userConstants.GENERATE_REPORT_LIST_REQUEST:
      return {
        ...state,
        loading: true,
        reportList: [],
        tostMsg: action.tostMsg,
      }
    case userConstants.GENERATE_REPORT_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        reportList: action.reportList.list,
        tostMsg: action.tostMsg,
      }
    case userConstants.GENERATE_REPORT_LIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action,
        reportList: [],
        tostMsg: action.tostMsg,
      }

    // report list 2
    case userConstants.GENERATE_REPORT_2_LIST_REQUEST:
      return {
        ...state,
        loading: true,
        reportList: [],
        tostMsg: action.tostMsg,
      }
    case userConstants.GENERATE_REPORT_2_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        reportList: action.reportList,
        tostMsg: action.tostMsg,
      }
    case userConstants.GENERATE_REPORT_2_LIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action,
        reportList: [],
        tostMsg: action.tostMsg,
      }

    // report list 3
    case userConstants.GENERATE_REPORT_3_LIST_REQUEST:
      return {
        ...state,
        loading: true,
        reportList: [],
        tostMsg: action.tostMsg,
      }
    case userConstants.GENERATE_REPORT_3_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        reportList: action.reportList.list,
        tostMsg: action.tostMsg,
      }
    case userConstants.GENERATE_REPORT_3_LIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action,
        reportList: [],
        tostMsg: action.tostMsg,
      }

    // report list 4
    case userConstants.GENERATE_REPORT_4_LIST_REQUEST:
      return {
        ...state,
        loading: true,
        reportList: [],
        tostMsg: action.tostMsg,
      }
    case userConstants.GENERATE_REPORT_4_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        reportList: action.reportList.list,
        tostMsg: action.tostMsg,
      }
    case userConstants.GENERATE_REPORT_4_LIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action,
        reportList: [],
        tostMsg: action.tostMsg,
      }

    // History of inspection asset report
    case userConstants.HISTORY_OF_INSPECTION_ASSET_REPORT_REQUEST:
      return {
        ...state,
        loading: true,
        historyReportList: _.get(state, ['historyReportList'], {}),
        tostMsg: action.tostMsg,
        type: userConstants.HISTORY_OF_INSPECTION_ASSET_REPORT_REQUEST,
      }
    case userConstants.HISTORY_OF_INSPECTION_ASSET_REPORT_SUCCESS:
      let list = _.get(state, ['historyReportList', 'list'], [])
      //console.log("list ", list);

      if (action.pageIndex == 1) {
        list = action.reportList
      } else {
        if (_.isEmpty(list)) {
          list = action.reportList
        } else {
          action.reportList.list = _.concat(list, action.reportList.list)
          list = action.reportList
        }
      }

      return {
        ...state,
        loading: false,
        // historyReportList: action.reportList,
        historyReportList: list,
        tostMsg: action.tostMsg,
        isDataNoFound: action.reportList.list.length > 0 ? false : true,
        type: userConstants.HISTORY_OF_INSPECTION_ASSET_REPORT_SUCCESS,
      }
    case userConstants.HISTORY_OF_INSPECTION_ASSET_REPORT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action,
        historyReportList: [],
        tostMsg: action.tostMsg,
        type: userConstants.HISTORY_OF_INSPECTION_ASSET_REPORT_FAILURE,
      }

    // Generate inspection of asset report
    case userConstants.GENERATE_INSPECTION_OF_ASSET_REPORT_REQUEST:
      return {
        ...state,
        loading: true,
        reportData: {},
        tostMsg: action.tostMsg,
        type: userConstants.GENERATE_INSPECTION_OF_ASSET_REPORT_REQUEST,
      }
    case userConstants.GENERATE_INSPECTION_OF_ASSET_REPORT_SUCCESS:
      return {
        ...state,
        loading: false,
        reportData: action.reportList.data,
        tostMsg: action.tostMsg,
        type: userConstants.GENERATE_INSPECTION_OF_ASSET_REPORT_SUCCESS,
      }
    case userConstants.GENERATE_INSPECTION_OF_ASSET_REPORT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action,
        reportData: {},
        tostMsg: action.tostMsg,
        type: userConstants.GENERATE_INSPECTION_OF_ASSET_REPORT_FAILURE,
      }

    // Check status of inspection od asset report
    case userConstants.CHECK_STATUS_INSPECTION_OF_ASSET_REPORT_REQUEST:
      return {
        ...state,
        loading: true,
        reportList: [],
        tostMsg: action.tostMsg,
        type: userConstants.CHECK_STATUS_INSPECTION_OF_ASSET_REPORT_REQUEST,
      }
    case userConstants.CHECK_STATUS_INSPECTION_OF_ASSET_REPORT_SUCCESS:
      let historyReportList = state.historyReportList
      //console.log("historyReportList  ", historyReportList);
      //console.log("action.reportList  ",action.reportList);

      action.reportList.map((value, key) => {
        let objIndex = historyReportList.list.findIndex(obj => obj.report_id == value.report_id)
        historyReportList.list[objIndex].status = value.status
        historyReportList.list[objIndex].status_name = value.status_name
      })

      return {
        ...state,
        loading: false,
        historyReportList: historyReportList,
        reportList: action.reportList,
        tostMsg: action.tostMsg,
        type: userConstants.CHECK_STATUS_INSPECTION_OF_ASSET_REPORT_SUCCESS,
      }
    case userConstants.CHECK_STATUS_INSPECTION_OF_ASSET_REPORT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action,
        reportList: [],
        tostMsg: action.tostMsg,
        type: userConstants.CHECK_STATUS_INSPECTION_OF_ASSET_REPORT_FAILURE,
      }

    // get all asset id list
    case userConstants.GET_ALL_ASSET_ID_LIST_REQUEST:
      return {
        ...state,
        loading: true,
        assetList: [],
        tostMsg: action.tostMsg,
        type: userConstants.GET_ALL_ASSET_ID_LIST_REQUEST,
      }
    case userConstants.GET_ALL_ASSET_ID_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        assetList: action.assetlist,
        tostMsg: action.tostMsg,
        type: userConstants.GET_ALL_ASSET_ID_LIST_SUCCESS,
      }
    case userConstants.GET_ALL_ASSET_ID_LIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action,
        assetList: [],
        tostMsg: action.tostMsg,
        type: userConstants.GET_ALL_ASSET_ID_LIST_FAILURE,
      }
    default:
      return state
  }
}
