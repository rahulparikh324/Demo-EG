import logout from '../Services/logoutService'
import { history } from '../helpers/history'
// import {alert} from "../components/alertMessage";
// import userConstants from "../Constants/userConstants";
import enums from '../Constants/enums'
import $ from 'jquery'

export default function logoutAction(urlParameters) {
  var tostMsg = { msg: '', type: '' }
  logout(urlParameters)
    .then(response => {
      $('#pageLoading').hide()
      if (response.data.success > 0) {
        localStorage.clear()
        history.push('/login')
      } else {
        tostMsg.msg = response.data.message
        tostMsg.type = enums.toastMsgType[1].id
        history.push('/login')
        localStorage.setItem('tostMsg', JSON.stringify(tostMsg))
      }
    })
    .catch(error => {
      $('#pageLoading').hide()
      //console.log(error)
      tostMsg.msg = error.msg
      tostMsg.type = enums.toastMsgType[1].id
      localStorage.clear()
      history.push('/login')
      localStorage.setItem('tostMsg', JSON.stringify(tostMsg))
    })
}
