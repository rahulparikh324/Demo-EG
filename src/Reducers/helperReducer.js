import userConstants from '../Constants/userConstants'

const initialState = {
  count: 0,
}

const helperReducer = (state = initialState, action) => {
  switch (action.type) {
    case userConstants.CHANGE_MR_OPEN_COUNT:
      return {
        count: state.count + 1,
      }
    default:
      return state
  }
}

export default helperReducer
