import $ from 'jquery'
import _ from 'lodash'
import GetAwsAuthCredetial from '../Actions/GetAwsAuthCredetialAction'
import Amplify, { Auth } from 'aws-amplify'
import getDomainName from '../helpers/getDomainName'
import enums from 'Constants/enums'
import { Toast } from 'Snackbar/useToast'
import { history } from 'helpers/history'

export default async function getToken() {
  return new Promise((resolve, reject) => {
    $('#pageLoading').show()
    GetAwsAuthCredetial(getDomainName())
      .then(async authcredetilas => {
        Amplify.configure({ Auth: authcredetilas })
        try {
          const session = await Auth.currentSession()
          localStorage.setItem('accessToken', session.idToken.jwtToken)
          const expireTokenDate = new Date(session.idToken.payload.exp * 1000).toISOString()
          localStorage.setItem('expireAwsTokenDate', expireTokenDate)
          resolve(session.idToken.jwtToken)
          $('#pageLoading').hide()
        } catch (error) {
          if (_.isObject(error) && _.has(error, 'code') && error.code === enums.AWS_CODE.NotAuthorizedException && window.location.href !== 'login') {
            Toast.error(enums.resMessages.status_401)
            localStorage.clear()
            localStorage.setItem('domainName', getDomainName())
            history.push('/login')
          }
          console.log('getToken error - ', error)
          reject(error)
          $('#pageLoading').hide()
        }
      })
      .catch(error => {
        console.log('getToken.GetAwsAuthCredetial error - ', error)
        $('#pageLoading').hide()
        reject(error)
      })
  })
}
