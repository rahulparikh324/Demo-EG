import userConstants from '../../Constants/userConstants'
import _ from 'lodash'

export default function assetDetailReducer(state = {}, action) {
  //console.log("state----------------",state);
  //console.log("action---------------",action);
  var assetDetail = _.get(state, ['assetDetail'], {})
  switch (action.type) {
    case userConstants.ASSETDETAIL_REQUEST:
      return {
        ...state,
        loading: true,
        assetDetail: {},
        inspectionList: [],
        workOrderList: [],
        tostMsg: action.tostMsg,
      }
    case userConstants.ASSETDETAIL_SUCCESS:
      return {
        ...state,
        loading: false,
        assetDetail: action.assetDetail,
        inspectionList: _.get(action.assetDetail, ['inspections'], []),
        workOrderList: _.get(action.assetDetail, ['workOrders'], []),
        action: action.type,
        tostMsg: action.tostMsg,
      }
    case userConstants.ASSETDETAIL_FAILURE:
      return {
        ...state,
        loading: false,
        error: action,
        tostMsg: action.tostMsg,
      }

    //Update Meter Hour
    case userConstants.UPDATE_METER_HOUR_REQUEST:
      return {
        ...state,
        loading: true,
        Updateddata: {},
        tostMsg: action.tostMsg,
        assetDetail: assetDetail,
      }
    case userConstants.UPDATE_METER_HOUR_SUCCESS:
      return {
        ...state,
        loading: false,
        Updateddata: action,
        action: action.type,
        tostMsg: action.tostMsg,
        assetDetail: assetDetail,
      }
    case userConstants.UPDATE_METER_HOUR_FAILURE:
      return {
        ...state,
        loading: false,
        error: action,
        tostMsg: action.tostMsg,
        assetDetail: assetDetail,
      }

    default:
      return state
  }
}
