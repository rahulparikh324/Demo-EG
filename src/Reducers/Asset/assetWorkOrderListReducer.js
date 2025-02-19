import userConstants from '../../Constants/userConstants'
import _ from 'lodash'

export default function assetWorkOrderListReducer(state = {}, action) {
  let workOrderList = _.get(state, ['workOrderList'], [])
  // let workOrderList = _.get(state, ['assetDetail', 'workOrderList'], {})
  switch (action.type) {
    case userConstants.ASSET_WORKORDER_LIST_REQUEST:
      return {
        loading: true,
        assetDetail: { workOrderList: _.get(state, ['workOrderList'], []) },
        workOrderList: workOrderList,
        tostMsg: action.tostMsg,
      }
    case userConstants.ASSET_WORKORDER_LIST_SUCCESS:
      if (action.pageIndex === 1) {
        return {
          loading: false,
          workOrderList: _.get(action, ['workOrderList', 'list'], []),
          totalWorkOrderListCnt: _.get(action, ['workOrderList', 'listsize'], []),
          isDataNoFound: action.workOrderList.list.length > 0 ? false : true,
          action: action.type,
          tostMsg: action.tostMsg,
        }
      } else {
        return {
          loading: false,
          workOrderList: _.isEmpty(workOrderList) ? action.workOrderList.list : _.concat(workOrderList, action.workOrderList.list),
          totalWorkOrderListCnt: _.get(action, ['workOrderList', 'listsize'], []),
          isDataNoFound: action.workOrderList.list.length > 0 ? false : true,
          action: action.type,
          tostMsg: action.tostMsg,
        }
      }
    case userConstants.ASSET_WORKORDER_LIST_FAILURE:
      return {
        loading: false,
        error: action,
        tostMsg: action.tostMsg,
      }

    case userConstants.ASSET_WORKORDER_SEARCH_LIST_REQUEST:
      return {
        loading: true,
        assetDetail: { workOrderList: _.get(state, ['workOrderList'], []) },
        workOrderList: workOrderList,
        tostMsg: action.tostMsg,
      }
    case userConstants.ASSET_WORKORDER_SEARCH_LIST_SUCCESS:
      if (action.pageIndex === 1) {
        return {
          loading: false,
          workOrderList: _.get(action, ['workOrderList', 'list'], []),
          totalWorkOrderListCnt: _.get(action, ['workOrderList', 'listsize'], []),
          isDataNoFound: action.workOrderList.list.length > 0 ? false : true,
          action: action.type,
          tostMsg: action.tostMsg,
        }
      } else {
        return {
          loading: false,
          workOrderList: _.isEmpty(workOrderList) ? action.workOrderList.list : _.concat(workOrderList, action.workOrderList.list),
          totalWorkOrderListCnt: _.get(action, ['workOrderList', 'listsize'], []),
          isDataNoFound: action.workOrderList.list.length > 0 ? false : true,
          action: action.type,
          tostMsg: action.tostMsg,
        }
      }
    case userConstants.ASSET_WORKORDER_SEARCH_LIST_FAILURE:
      return {
        loading: false,
        error: action,
        tostMsg: action.tostMsg,
      }
    default:
      return state
  }
}
