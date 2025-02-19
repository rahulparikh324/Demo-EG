import userConstants from '../../Constants/userConstants'

const updateWorkOrderFilterState = state => ({ type: userConstants.UPDATE_WORKORDER_FILTER_STATE, payload: state })

export default function workOrderFilterStateAction(state) {
  return dispatch => dispatch(updateWorkOrderFilterState(state))
}
