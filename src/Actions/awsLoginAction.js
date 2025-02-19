import $ from 'jquery'
import enums from '../Constants/enums'
import GetAwsAuthCredetial from './GetAwsAuthCredetialAction'
import login from '../Services/loginService'
import Amplify, { Auth } from 'aws-amplify'
import { get } from 'lodash'

export default function awsLoginAction(username, password, companyCode, requestData) {
  var resObj = {}
  var tostMsg = { msg: enums.resMessages.awsLoginFailResponse, type: enums.toastMsgType[1].id }

  return new Promise((resolve, reject) => {
    GetAwsAuthCredetial(companyCode)
      .then(authcredetilas => {
        Amplify.configure({ Auth: authcredetilas })
        Auth.signIn(username, password)
          .then(user => {
            if (user) {
              localStorage.setItem('AuthResponse', JSON.stringify(user))
              if (user.challengeName === 'SMS_MFA' || user.challengeName === 'SOFTWARE_TOKEN_MFA') {
                resObj = { data: user, mfaRequired: true, cognitoMfaTimer: get(authcredetilas, 'cognitoMfaTimer', 120), tostMsg: {} }
                resolve(resObj)
              } else if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
                resObj = { data: user, tostMsg: {} }
                window.location.replace('/setpassword')
              } else {
                if (user.signInUserSession !== null) {
                  localStorage.setItem('accessToken', user.signInUserSession.idToken.jwtToken)
                  const expireTokenDate = new Date(user.signInUserSession.idToken.payload.exp * 1000).toISOString()
                  localStorage.setItem('expireAwsTokenDate', expireTokenDate)
                  login(requestData)
                    .then(response => {
                      if (response.data.success > 0) {
                        var loginRes = response.data.data
                        resolve(loginRes)
                      } else {
                        $('#pageLoading').hide()
                        localStorage.clear()
                        tostMsg.msg = response.data.message
                        tostMsg.type = enums.toastMsgType[1].id
                        resObj = {
                          data: response.data.data,
                          tostMsg: tostMsg,
                        }
                        reject(resObj)
                      }
                    })
                    .catch(error => {
                      $('#pageLoading').hide()
                      localStorage.clear()
                      resObj = { tostMsg: { msg: error, type: enums.toastMsgType[1].id } }
                      reject(resObj)
                    })
                } else {
                  $('#pageLoading').hide()
                  localStorage.clear()
                  resObj = { data: user, tostMsg: tostMsg }
                  reject(resObj)
                }
              }
            }
          })
          .catch(err => {
            $('#pageLoading').hide()
            localStorage.clear()
            if (err) {
              tostMsg.msg = err.message
            }
            resObj = {
              data: err,
              tostMsg: tostMsg,
            }
            reject(resObj)
          })
      })
      .catch(error => {
        $('#pageLoading').hide()
        resObj = {
          data: error,
          tostMsg: tostMsg,
        }
        reject(resObj)
      })
  })
}
