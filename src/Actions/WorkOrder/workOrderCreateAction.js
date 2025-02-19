import workOrderCreate from '../../Services/WorkOrder/workOrderCreateService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import $ from 'jquery'
import enums from '../../Constants/enums'

export default function workOrderCreateAction(requestData, type) {
  return dispatch => {
    dispatch(request({}))
    workOrderCreate(requestData)
      .then(response => {
        $('#pageLoading').hide()
        if (response.data.success > 0) {
          dispatch(success(response.data.data))
          if (type === enums.createWorkOrderType[1].id) {
            window.location.replace('../../workorders')
          } else {
            window.location.replace('../../inspections')
          }
        } else {
          alert.errorMessage(response.data.message)
        }
      })
      .catch(error => {
        $('#pageLoading').hide()
        dispatch(failure(error))
      })
  }
  function request(workOrderCreate) {
    return { type: userConstants.WORKORDERCREATE_REQUEST, workOrderCreate }
  }
  function success(workOrderCreate) {
    return { type: userConstants.WORKORDERCREATE_SUCCESS, workOrderCreate }
  }
  function failure(error) {
    return { type: userConstants.WORKORDERCREATE_FAILURE, error }
  }
}
