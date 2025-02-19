import userConstants from '../../Constants/userConstants'

const updateUserFilterState = state => ({ type: userConstants.UPDATE_USER_FILTER_STATE, payload: state })

export default function userFilterStateAction(state) {
  return dispatch => dispatch(updateUserFilterState(state))
}
