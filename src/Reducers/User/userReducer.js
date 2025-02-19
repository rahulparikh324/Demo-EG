import userConstants from '../../Constants/userConstants'
import _ from 'lodash'
import enums from '../../Constants/enums'

export default function userReducer(state = {}, action) {
  //console.log('state user-----------', state)
  //console.log('action user----------', action)
  let userList = _.get(state, ['userList'], {})
  //console.log('userList------------------', userList)
  switch (action.type) {
    // User List
    case userConstants.USER_LIST_REQUEST:
      return {
        ...state,
        loading: true,
        userList: _.get(state, ['userList'], {}),
        listsize: _.get(state, ['listsize'], 0),
        tostMsg: action.tostMsg,
      }
    case userConstants.USER_LIST_SUCCESS:
      if (action.pageIndex == 1) {
        return {
          ...state,
          loading: false,
          userList: action.userList.list,
          isDataNoFound: action.userList.listsize != action.userList.list.length ? false : true,
          searchString: '',
          listsize: action.userList.listsize,
          tostMsg: action.tostMsg,
        }
      } else {
        //console.log('in else---------', userList)
        var concatuserList = _.isEmpty(userList) ? action.userList.list : _.concat(userList, action.userList.list)
        return {
          ...state,
          loading: false,
          userList: _.isEmpty(userList) ? action.userList.list : _.concat(userList, action.userList.list),
          isDataNoFound: action.userList.listsize != concatuserList.length ? false : true,
          searchString: '',
          listsize: action.userList.listsize,
          tostMsg: action.tostMsg,
        }
      }
    case userConstants.USER_LIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action,
        userList: [],
        tostMsg: action.tostMsg,
      }

    // Update user status
    case userConstants.UPDATE_USER_STATUS_REQUEST:
      return {
        ...state,
        loading: true,
        userList: _.get(state, ['userList'], {}),
        tostMsg: action.tostMsg,
      }
    case userConstants.UPDATE_USER_STATUS_SUCCESS:
      if (userList) {
        userList.map((value, key) => {
          if (value.uuid == action.updateUserStatus.requestData.userid) {
            enums.userStatus.map((value1, key1) => {
              if (value1.id == action.updateUserStatus.requestData.status) {
                value.status = value1.id
                value.status_name = value1.status
              }
            })
          }
        })
      }
      return {
        ...state,
        loading: false,
        userList: userList,
        tostMsg: action.tostMsg,
      }
    case userConstants.UPDATE_USER_STATUS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action,
        tostMsg: action.tostMsg,
      }

    // GET USER ROLES CASES
    case userConstants.GET_USER_ROLES_REQUEST:
      return {
        ...state,
        loading: true,
        userRoles: [],
        tostMsg: action.tostMsg,
      }
    case userConstants.GET_USER_ROLES_SUCCESS:
      return {
        ...state,
        loading: false,
        userRoles: action.userRoles,
        tostMsg: action.tostMsg,
      }
    case userConstants.GET_USER_ROLES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action,
        userRoles: [],
        tostMsg: action.tostMsg,
      }

    // Search in user list cases
    case userConstants.USER_LIST_SEARCH_REQUEST:
      return {
        ...state,
        loading: true,
        userList: _.get(state, ['userList'], {}),
        listsize: _.get(state, ['listsize'], 0),
        tostMsg: action.tostMsg,
      }
    case userConstants.USER_LIST_SEARCH_SUCCESS:
      if (action.pageIndex == 1) {
        return {
          ...state,
          loading: false,
          userList: action.userList.list,
          isDataNoFound: action.userList.listsize != action.userList.list.length ? false : true,
          searchString: action.searchString,
          listsize: action.userList.listsize,
          tostMsg: action.tostMsg,
        }
      } else {
        var concatuserList = _.isEmpty(userList) ? action.userList.list : _.concat(userList, action.userList.list)
        return {
          ...state,
          loading: false,
          userList: _.isEmpty(userList) ? action.userList.list : _.concat(userList, action.userList.list),
          isDataNoFound: action.userList.listsize != concatuserList.length ? false : true,
          searchString: action.searchString,
          listsize: action.userList.listsize,
          tostMsg: action.tostMsg,
        }
      }
    case userConstants.USER_LIST_SEARCH_FAILURE:
      return {
        ...state,
        loading: false,
        error: action,
        userList: [],
        tostMsg: action.tostMsg,
      }

    //Create  User
    case userConstants.CREATE_USER_REQUEST:
      return {
        ...state,
        loading: true,
        createUser: action,
        tostMsg: action.tostMsg,
      }
    case userConstants.CREATE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        createUser: action.createUser,
        tostMsg: action.tostMsg,
      }

    case userConstants.CREATE_USER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action,
        tostMsg: action.tostMsg,
      }

    //Update  User
    case userConstants.UPDATE_USER_REQUEST:
      return {
        ...state,
        loading: true,
        updateUser: action,
        tostMsg1: action.tostMsg,
      }
    case userConstants.UPDATE_USER_SUCCESS:
      if (userList) {
        //console.log('Update user succ action > ', userList)
        var statusName = ''
        enums.userStatus.map((value1, key) => {
          if (value1.id == action.updateUser.status) {
            statusName = value1.status
          }
        })
        // userList.map((value, key) => {
        //   if (value.uuid == action.updateUser.uuid) {
        //     value.email = action.updateUser.email
        //     value.rolename = action.updateUser.rolename
        //     value.status = action.updateUser.status
        //     value.username = action.updateUser.username
        //     value.usersites = action.updateUser.usersites
        //     value.status_name = statusName
        //   }
        // })
      }
      return {
        ...state,
        loading: false,
        updateUser: action.updateUser,
        //userList: userList,
        tostMsg1: action.tostMsg,
      }

    case userConstants.UPDATE_USER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action,
        tostMsg1: action.tostMsg,
      }

    default:
      return state
  }
}
