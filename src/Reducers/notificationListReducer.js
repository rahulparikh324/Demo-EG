import userConstants from '../Constants/userConstants'
import _ from 'lodash'
export default function notificationListReducer(state = {}, action) {
  //console.log('state---------------',state);
  //console.log('action--------------',action);
  let preNotificationList = _.get(state, ['notificationList'], [])
  switch (action.type) {
    case userConstants.NOTIFICATION_LIST_REQUEST:
      return {
        loading: true,
        notificationList: preNotificationList,
        tostMsg: action.tostMsg,
      }
    case userConstants.NOTIFICATION_LIST_SUCCESS:
      if (action.pageIndex == 1) {
        return {
          loading: false,
          notificationList: action.notificationList.list,
          isDataNoFound: action.notificationList.list.length > 0 ? false : true,
          listsize: action.notificationList.listsize,
          tostMsg: action.tostMsg,
        }
      } else {
        return {
          loading: false,
          notificationList: _.isEmpty(preNotificationList) ? action.notificationList.list : _.concat(preNotificationList, action.notificationList.list),
          isDataNoFound: action.notificationList.list.length > 0 ? false : true,
          listsize: action.notificationList.listsize,
          tostMsg: action.tostMsg,
        }
      }
    case userConstants.noti:
      return {
        loading: false,
        error: action,
        tostMsg: action.tostMsg,
      }
    default:
      return state
  }
}
