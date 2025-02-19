export default function inspectionStateUpdate() {
  return dispatch => {
    dispatch({ type: 'CLEAR_TOAST_MSG' })
  }
}
