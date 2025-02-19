export default function dashboardStateUpdate() {
  return dispatch => {
    dispatch({ type: 'CLEAR_TOAST_MSG' })
  }
}
