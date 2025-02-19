import userConstants from '../../Constants/userConstants'
import _ from 'lodash'
import enums from '../../Constants/enums'
export default function assetListReducer(state = {}, action) {
  //console.log('state list ---------', state)
  //console.log('action-------------', action)
  let assetList = _.get(state, ['assetList'], {})
  let assetListSize = _.get(state, ['listsize'], 0)
  switch (action.type) {
    case userConstants.ASSETLIST_REQUEST:
      return {
        loading: true,
        assetList: _.get(state, ['assetList'], {}),
        listsize: assetListSize,
        tostMsg: action.tostMsg,
      }
    case userConstants.ASSETLIST_SUCCESS:
      if (action.pageIndex === 1) {
        return {
          loading: false,
          assetList: action.assetList.list,
          isDataNoFound: action.assetList.list.length > 0 ? false : true,
          searchString: '',
          listsize: action.assetList.listsize,
          tostMsg: action.tostMsg,
        }
      } else {
        return {
          loading: false,
          assetList: _.isEmpty(assetList) ? action.assetList.list : _.concat(assetList, action.assetList.list),
          isDataNoFound: action.assetList.list.length > 0 ? false : true,
          searchString: '',
          listsize: action.assetList.listsize,
          tostMsg: action.tostMsg,
        }
      }
    case userConstants.ASSETLIST_FAILURE:
      return {
        loading: false,
        error: action,
        assetList: [],
        tostMsg: action.tostMsg,
      }

    case userConstants.ASSETLIST_SEARCH_REQUEST:
      return {
        loading: true,
        assetList: _.get(state, ['assetList'], {}),
        listsize: assetListSize,
        tostMsg: action.tostMsg,
      }
    case userConstants.ASSETLIST_SEARCH_SUCCESS:
      //console.log('-----------------', action.assetList.list)
      if (action.pageIndex === 1) {
        return {
          loading: false,
          assetList: action.assetList.list,
          isDataNoFound: action.assetList.list.length > 0 ? false : true,
          searchString: action.searchString,
          listsize: action.assetList.listsize,
          tostMsg: action.tostMsg,
        }
      } else {
        return {
          loading: false,
          assetList: _.isEmpty(assetList) ? action.assetList.list : _.concat(assetList, action.assetList.list),
          isDataNoFound: action.assetList.list.length > 0 ? false : true,
          searchString: action.searchString,
          listsize: action.assetList.listsize,
          tostMsg: action.tostMsg,
        }
      }
    case userConstants.ASSETLIST_SEARCH_FAILURE:
      return {
        loading: false,
        error: action,
        assetList: [],
        tostMsg: action.tostMsg,
      }
    // Update asset status case
    case userConstants.UPDATE_ASSET_STATUS_REQUEST:
      return {
        ...state,
        loading: true,
        assetList: _.get(state, ['assetList'], {}),
        listsize: assetListSize,
        tostMsg: action.tostMsg,
      }
    case userConstants.UPDATE_ASSET_STATUS_SUCCESS:
      if (assetList) {
        assetList.map((value, key) => {
          if (value.asset_id === action.updateAssetStatus.requestData.asset_id) {
            enums.assetStatus.map((value1, key1) => {
              if (value1.id === action.updateAssetStatus.requestData.status) {
                value.status = value1.id
                value.status_name = value1.status
              }
              return null
            })
          }
          return null
        })
      }
      return {
        ...state,
        loading: false,
        assetList: assetList,
        listsize: assetListSize,
        tostMsg: action.tostMsg,
      }
    case userConstants.UPDATE_ASSET_STATUS_FAILURE:
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
