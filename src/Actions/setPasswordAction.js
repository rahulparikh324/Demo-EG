import Amplify, { Auth } from 'aws-amplify'
import userConstants from '../Constants/userConstants'
import $ from 'jquery'
import _ from 'lodash'
import enums from '../Constants/enums'
import GetAwsAuthCredetial from './GetAwsAuthCredetialAction'
var AWS = require('aws-sdk')

export default function setPassword(password, companyCode) {
  var resObj = {}
  var tostMsg = {
    msg: enums.resMessages.awsLoginFailResponse,
    type: enums.toastMsgType[1].id,
  }
  var authuser = localStorage.getItem('AuthResponse')
  authuser = JSON.parse(authuser)

  return new Promise((resolve, reject) => {
    GetAwsAuthCredetial(companyCode)
      .then(authcredetilas => {
        //console.log(authcredetilas)
        Amplify.configure({
          Auth: authcredetilas,
        })

        var params = {
          ChallengeName: 'NEW_PASSWORD_REQUIRED',
          ClientId: authcredetilas.userPoolWebClientId,
          ChallengeResponses: {
            USERNAME: authuser.username,
            NEW_PASSWORD: password,
          },

          Session: authuser.Session,
        }
        AWS.config.update({ region: authcredetilas.region })
        var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider()

        cognitoidentityserviceprovider.respondToAuthChallenge(params, function (err, data) {
          if (err) {
            reject(err)
          } else {
            resolve(data)
          }
        })
      })
      .catch(error => {
        resObj = {
          data: error,
          tostMsg: tostMsg,
        }
        reject(resObj)
      })
  })
}
