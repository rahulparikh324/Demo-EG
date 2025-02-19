import updateMeterHour from '../../Services/Asset/updateAssetMeterHoursService'
import userConstants from '../../Constants/userConstants'
import { alert } from '../../components/alertMessage'
import enums from '../../Constants/enums'
import $ from 'jquery'

export default function updateMeterHourAction(requestData) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    dispatch(request(requestData, tostMsg))
    updateMeterHour(requestData)
      .then(response => {
        $('#pageLoading').hide()
        if (response.data.success > 0) {
          tostMsg.msg = enums.resMessages.updateMeterHour
          tostMsg.type = enums.toastMsgType[0].id
          // alert.successMessage(enums.resMessages.updateMeterHour);
          dispatch(success(response.data, tostMsg))
        } else {
          tostMsg.msg = response.data.message
          tostMsg.type = enums.toastMsgType[1].id
          // alert.errorMessage(response.data.message);
          dispatch(failure(response.data, tostMsg))
        }
      })
      .catch(error => {
        tostMsg.msg = error
        tostMsg.type = enums.toastMsgType[1].id
        $('#pageLoading').hide()
        dispatch(failure(error))
      })
  }
  function request(Updateddata, tostMsg) {
    return { type: userConstants.UPDATE_METER_HOUR_REQUEST, Updateddata, tostMsg }
  }
  function success(Updateddata, tostMsg) {
    return { type: userConstants.UPDATE_METER_HOUR_SUCCESS, Updateddata, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.UPDATE_METER_HOUR_FAILURE, error, tostMsg }
  }
}
