import UpdateDefaultRoleService from '../Services/UpdateDefaultRoleService'
import $ from 'jquery'
import _ from 'lodash'
import enums from '../Constants/enums'

export default function updateDefaultRole(requestData) {
  return new Promise((resolve, reject) => {
    var tostMsg = { msg: '', type: '' }
    UpdateDefaultRoleService(requestData)
      .then(response => {
        $('#pageLoading').hide()
        if (response.data.success > 0) {
          tostMsg.msg = enums.resMessages.updateDefaultRole
          tostMsg.type = enums.toastMsgType[0].id

          resolve({ data: response.data.data, tostMsg: tostMsg })
        } else {
          // alert.errorMessage(response.data.message);
          tostMsg.msg = response.data.message
          tostMsg.type = enums.toastMsgType[1].id
          reject({ error: response.data.data, tostMsg: tostMsg })
        }
      })
      .catch(error => {
        $('#pageLoading').hide()
        tostMsg.msg = error.data.message
        tostMsg.type = enums.toastMsgType[1].id
        reject({ error: error, tostMsg: tostMsg })
      })
  })
}
