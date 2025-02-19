import userConstants from '../../Constants/userConstants'
import _ from 'lodash'
export default function workOrderListReducer(state = {}, action) {
  let workOrderList = _.get(state, ['workOrderData'], {})
  let workOrderListSize = _.get(state, ['listsize'], {})
  switch (action.type) {
    case userConstants.WORKORDERLIST_REQUEST:
      return {
        loading: true,
        workOrderData: _.get(state, ['workOrderData'], {}),
        listsize: workOrderListSize,
        tostMsg: action.tostMsg,
      }
    case userConstants.WORKORDERLIST_SUCCESS:
      if (action.pageIndex === 1) {
        return {
          loading: false,
          workOrderData: action.workOrderList.list,
          isDataNoFound: action.workOrderList.list.length > 0 ? false : true,
          searchString: '',
          listsize: action.workOrderList.listsize,
          tostMsg: action.tostMsg,
        }
      } else {
        let list = _.isEmpty(workOrderList) ? action.workOrderList.list : _.concat(workOrderList, action.workOrderList.list)
        return {
          loading: false,
          workOrderData: _.isEmpty(workOrderList) ? action.workOrderList.list : _.concat(workOrderList, action.workOrderList.list),
          isDataNoFound: list.length < action.workOrderList.listsize ? false : true,
          searchString: '',
          listsize: action.workOrderList.listsize,
          tostMsg: action.tostMsg,
        }
      }
    case userConstants.WORKORDERLIST_FAILURE:
      return {
        loading: false,
        error: action,
        workOrderData: [],
        tostMsg: action.tostMsg,
      }

    case userConstants.WORKORDERLIST_SEARCH_REQUEST:
      return {
        loading: true,
        workOrderData: _.get(state, ['workOrderData'], {}),
        listsize: workOrderListSize,
        tostMsg: action.tostMsg,
      }
    case userConstants.WORKORDERLIST_SEARCH_SUCCESS:
      if (action.pageIndex === 1) {
        return {
          loading: false,
          workOrderData: action.workOrderList.list,
          isDataNoFound: action.workOrderList.list.length > 0 ? false : true,
          searchString: action.searchString,
          listsize: action.workOrderList.listsize,
          tostMsg: action.tostMsg,
        }
      } else {
        let list = _.isEmpty(workOrderList) ? action.workOrderList.list : _.concat(workOrderList, action.workOrderList.list)
        return {
          loading: false,
          workOrderData: _.isEmpty(workOrderList) ? action.workOrderList.list : _.concat(workOrderList, action.workOrderList.list),
          isDataNoFound: list.length < action.workOrderList.listsize ? false : true,
          searchString: action.searchString,
          listsize: action.workOrderList.listsize,
          tostMsg: action.tostMsg,
        }
      }
    case userConstants.WORKORDERLIST_SEARCH_FAILURE:
      return {
        loading: false,
        error: action,
        workOrderData: [],
        tostMsg: action.tostMsg,
      }
    default:
      return state
  }
}
