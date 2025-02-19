import getAwsAuthCredetial from '../Services/getAwsAuthCredetialService'
import userConstants from '../Constants/userConstants'
import $ from 'jquery'
import _ from 'lodash'
import enums from '../Constants/enums'

export default function GetAwsAuthCredetial(companyCode) {
  return new Promise((resolve, reject) => {
    getAwsAuthCredetial(companyCode)
      .then(response => {
        if (response.data.success > 0) {
          resolve({
            identityPoolId: response.data.data.identity_pool_id,
            region: response.data.data.region,
            userPoolId: response.data.data.user_pool_id,
            userPoolWebClientId: response.data.data.user_pool_web_client_id,
            cognitoMfaTimer: response.data.data.cognito_mfa_timer,
          })
        } else {
          reject(response)
        }
        // resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
