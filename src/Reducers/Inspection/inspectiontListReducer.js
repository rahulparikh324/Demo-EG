import userConstants from '../../Constants/userConstants'
import _ from 'lodash'
import enums from '../../Constants/enums'

export default function inspectionListReducer(state = {}, action) {
  //console.log("state inspection list -----------------",state);
  let inspectionList = _.get(state, ['inspectionLists'], {})
  let inspectionListSize = _.get(state, ['listsize'], 0)
  var tostmsg = _.get(state, ['tostMsg'], {})
  switch (action.type) {
    // Inspection List
    case userConstants.INSPECTIONLIST_REQUEST:
      return {
        ...state,
        loading: true,
        inspectionLists: _.get(state, ['inspectionLists'], {}),
        listsize: inspectionListSize,
        tostMsg: tostmsg,
        isReturnFromInspectionList: false,
      }
    case userConstants.INSPECTIONLIST_SUCCESS:
      if (action.pageIndex == 1) {
        return {
          loading: false,
          ...state,
          inspectionLists: action.inspectionList.list,
          isDataNoFound: action.inspectionList.list.length > 0 ? false : true,
          searchString: '',
          listsize: action.inspectionList.listsize,
          tostMsg: tostmsg,
          isReturnFromInspectionList: true,
        }
      } else {
        return {
          loading: false,
          ...state,
          inspectionLists: _.isEmpty(inspectionList) ? action.inspectionList.list : _.concat(inspectionList, action.inspectionList.list),
          isDataNoFound: action.inspectionList.list.length > 0 ? false : true,
          searchString: '',
          listsize: action.inspectionList.listsize,
          tostMsg: tostmsg,
          isReturnFromInspectionList: true,
        }
      }
    case userConstants.INSPECTIONLIST_FAILURE:
      return {
        loading: false,
        error: action,
        tostMsg: tostmsg,
        ...state,
        isReturnFromInspectionList: false,
      }

    // Inspection Search List
    case userConstants.INSPECTIONLIST_SEARCH_REQUEST:
      return {
        ...state,
        loading: true,
        inspectionLists: _.get(state, ['inspectionLists'], {}),
        listsize: inspectionListSize,
        tostMsg: tostmsg,
      }
    case userConstants.INSPECTIONLIST_SEARCH_SUCCESS:
      if (action.pageIndex == 1) {
        return {
          loading: false,
          ...state,
          inspectionLists: action.inspectionList.list,
          isDataNoFound: action.inspectionList.list.length > 0 ? false : true,
          searchString: action.searchString,
          listsize: action.inspectionList.listsize,
          tostMsg: tostmsg,
        }
      } else {
        return {
          loading: false,
          ...state,
          inspectionLists: _.isEmpty(inspectionList) ? action.inspectionList.list : _.concat(inspectionList, action.inspectionList.list),
          isDataNoFound: action.inspectionList.list.length > 0 ? false : true,
          searchString: action.searchString,
          listsize: action.inspectionList.listsize,
          tostMsg: tostmsg,
        }
      }
    case userConstants.INSPECTIONLIST_SEARCH_FAILURE:
      return {
        loading: false,
        error: action,
        tostMsg: action.tostMsg,
        ...state,
        inspectionLists: [],
      }

    // Inspection Approve
    case userConstants.APPROVEINAPECTION_REQUEST:
      return {
        ...state,
        loading: true,
        // inspectionDetail: action,
        tostMsg: action.tostMsg,
      }
    case userConstants.APPROVEINAPECTION_SUCCESS:
      let updatedInspectionList = _.get(state, ['inspectionLists'], [])
      //console.log("updatedInspectionList -------------",updatedInspectionList);
      if (updatedInspectionList) {
        // updatedInspectionList.map((value, key) => {
        //   if (value.inspection_id == action.approveInspection.inspectionId) {
        //     value.status = enums.inspectionStatus[2].id
        //     value.status_name = enums.inspectionStatus[2].status
        //     if (action.approveInspection.searchString) {
        //       if ((JSON.stringify(value.sites.site_name).includes(JSON.stringify(action.approveInspection.searchString)))
        //         || (JSON.stringify(value.asset.name).includes(JSON.stringify(action.approveInspection.searchString)))
        //         || (JSON.stringify(value.status_name).includes(JSON.stringify(action.approveInspection.searchString)))
        //         || (JSON.stringify(value.shift).includes(JSON.stringify(action.approveInspection.searchString)))
        //         || (JSON.stringify(value.operator_name).includes(JSON.stringify(action.approveInspection.searchString)))
        //       ) {
        //         //console.log("include--------------");
        //       } else {
        //         //console.log("not include-------");
        //         updatedInspectionList.splice(key, 1)
        //       }
        //     }
        //   }
        // })
      }

      return {
        loading: false,
        ...state,
        // inspectionDetail: action,
        inspectionLists: _.get(state, ['inspectionLists'], []),
        tostMsg: action.tostMsg,
      }
    case userConstants.APPROVEINAPECTION_FAILURE:
      return {
        loading: false,
        error: action,
        ...state,
        tostMsg: action.tostMsg,
      }

    // Inspection Details
    case userConstants.INSPECTIONDETAIL_REQUEST:
      return {
        ...state,
        loading: true,
        inspectionDetail: action,
        tostMsg: action.tostMsg,
      }
    case userConstants.INSPECTIONDETAIL_SUCCESS:
      return {
        loading: false,
        ...state,
        inspectionDetail: action.inspectionDetail,
        tostMsg: action.tostMsg,
      }

    case userConstants.INSPECTIONDETAIL_FAILURE:
      return {
        loading: false,
        error: action,
        tostMsg: action.tostMsg,
        ...state,
      }
    // clear tost msg
    case 'CLEAR_TOAST_MSG':
      return {
        loading: false,
        tostMsg: {},
        inspectionLists: _.get(state, ['inspectionLists'], {}),
        listsize: inspectionListSize,
        isReturnFromInspectionList: false,
      }
    // Upload Inspection Forms
    case userConstants.UPLOAD_INSPECTIONFORMS_REQUEST:
      return {
        loading: true,
        uploadInspection: action,
        tostMsg: action.tostMsg,
      }
    case userConstants.UPLOAD_INSPECTIONFORMS_SUCCESS:
      return {
        loading: false,
        uploadInspection: action,
        tostMsg: action.tostMsg,
      }

    case userConstants.UPLOAD_INSPECTIONFORMS_FAILURE:
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
