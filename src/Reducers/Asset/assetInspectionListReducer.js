import userConstants from '../../Constants/userConstants'
import _ from 'lodash'

export default function assetInspectionListReducer(state = {}, action) {
  //console.log("assetInspectionListReducer state list ------------",state);
  //console.log("action-------------",action) ;
  let inspectionList = _.get(state, ['inspectionList'], {})
  // if(inspectionList.length>0){

  // }else{
  //   inspectionList = _.get(state, ['inspectionList'], {})
  // }

  switch (action.type) {
    case userConstants.ASSET_INSPECTION_LIST_REQUEST:
      return {
        loading: true,
        assetDetail: { inspectionList: _.get(state, ['inspectionList'], {}) },
        inspectionList: inspectionList,
        tostMsg: action.tostMsg,
      }
    case userConstants.ASSET_INSPECTION_LIST_SUCCESS:
      if (action.pageIndex == 1) {
        return {
          loading: false,
          inspectionList: _.get(action, ['inspectionList', 'list'], []),
          totalInspectionListCnt: _.get(action, ['inspectionList', 'listsize'], []),
          action: action.type,
          isDataNoFound: action.inspectionList.length > 0 ? false : true,
          tostMsg: action.tostMsg,
        }
      } else {
        var inspectionlist = _.isEmpty(inspectionList) ? action.inspectionList.list : _.concat(action.inspectionList.list, inspectionList)

        return {
          loading: false,
          inspectionList: inspectionlist,
          totalInspectionListCnt: _.get(action, ['inspectionList', 'listsize'], []),
          action: action.type,
          isDataNoFound: action.inspectionList.length > 0 ? false : true,
          tostMsg: action.tostMsg,
        }
      }

    case userConstants.ASSET_INSPECTION_LIST_FAILURE:
      return {
        loading: false,
        error: action,
        tostMsg: action.tostMsg,
      }
    case userConstants.ASSET_INSPECTION_SEARCH_LIST_REQUEST:
      return {
        loading: true,
        assetDetail: { inspectionList: _.get(state, ['inspectionList'], {}) },
        tostMsg: action.tostMsg,
      }
    case userConstants.ASSET_INSPECTION_SEARCH_LIST_SUCCESS:
      if (action.pageIndex == 1) {
        return {
          loading: false,
          inspectionList: _.get(action, ['inspectionList', 'list'], []),
          totalInspectionListCnt: _.get(action, ['inspectionList', 'listsize'], []),
          action: action.type,
          isDataNoFound: action.inspectionList.length > 0 ? false : true,
          tostMsg: action.tostMsg,
        }
      } else {
        return {
          loading: false,
          inspectionList: _.isEmpty(inspectionList) ? action.inspectionList.list : _.concat(action.inspectionList.list, inspectionList),
          totalInspectionListCnt: _.get(action, ['inspectionList', 'listsize'], []),
          action: action.type,
          isDataNoFound: action.inspectionList.list.length > 0 ? false : true,
          tostMsg: action.tostMsg,
        }
      }
    case userConstants.ASSET_INSPECTION_SEARCH_LIST_FAILURE:
      return {
        loading: false,
        error: action,
        tostMsg: action.tostMsg,
      }
    default:
      return state
  }
}
