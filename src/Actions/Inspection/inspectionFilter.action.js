import userConstants from '../../Constants/userConstants'

const updateInspectionFilterState = state => ({ type: userConstants.UPDATE_INSPECTION_FILTER_STATE, payload: state })

export default function inspectionFilterStateAction(state) {
  return dispatch => dispatch(updateInspectionFilterState(state))
}
