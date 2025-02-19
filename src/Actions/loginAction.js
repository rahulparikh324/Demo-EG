import login from '../Services/loginService'
import userConstants from '../Constants/userConstants'
import { alert } from '../components/alertMessage'
import enums from '../Constants/enums'
import $ from 'jquery'
import { history } from '../helpers/history'
import { Toast } from '../Snackbar/useToast'
import { get } from 'lodash'
import { camelizeKeys } from 'helpers/formatters'

export default function loginAction(requestData, setLoginSiteData, setFeatureFlag) {
  var tostMsg = { msg: '', type: '' }
  return dispatch => {
    localStorage.setItem('authenticated', false)
    dispatch(request(requestData, tostMsg))
    //console.log(localStorage.getItem('domainName'), 'login action called')
    setTimeout(() => {
      login(requestData)
        .then(response => {
          if (response.data.success > 0) {
            localStorage.setItem('authenticated', true)
            localStorage.setItem('loginData', JSON.stringify(response.data.data))

            var loginRes = response.data.data

            var defaultRoleData = loginRes.userroles.filter(x => x.role_name == loginRes.default_rolename_web_name)

            localStorage.setItem('roleId', loginRes.default_rolename_web)
            localStorage.setItem('roleName', loginRes.default_rolename_web_name)
            localStorage.setItem('defaultroleId', loginRes.default_rolename_web)
            localStorage.setItem('defaultroleName', loginRes.default_rolename_web_name)

            localStorage.setItem('siteId', loginRes.default_site_id)
            localStorage.setItem('siteName', loginRes.default_site_name)
            localStorage.setItem('defaultSiteId', loginRes.default_site_id)
            localStorage.setItem('defaultSiteName', loginRes.default_site_name)

            localStorage.setItem('companyId', loginRes.default_company_id)
            localStorage.setItem('companyName', loginRes.default_company_name)
            localStorage.setItem('defaultCompanyId', loginRes.default_company_id)
            localStorage.setItem('defaultCompanyName', loginRes.default_company_name)

            localStorage.setItem('clientCompanyID', loginRes.ac_default_client_company)
            localStorage.setItem('clientCompanyName', loginRes.ac_default_client_company_name)
            localStorage.setItem('defaultClientCompanyID', loginRes.ac_default_client_company)
            localStorage.setItem('defaultClientCompanyName', loginRes.ac_default_client_company_name)
            localStorage.setItem('activeClientCompanyId', loginRes.ac_active_client_company)

            localStorage.setItem('userLoginSessionId', loginRes.user_session_id)

            sessionStorage.setItem('defaultroleName', loginRes.default_rolename_web_name)
            sessionStorage.setItem('roleName', loginRes.default_rolename_web_name)
            localStorage.setItem('toastMessageShown', 'true')

            setLoginSiteData({
              siteName: loginRes.default_site_name,
              defaultSiteName: loginRes.default_site_name,
              companyName: loginRes.default_company_name,
              defaultCompanyName: loginRes.default_company_name,
              clientCompanyName: loginRes.ac_default_client_company_name,
              userroles: camelizeKeys(get(loginRes, 'userroles', [])),
              client_company: camelizeKeys(get(loginRes, 'client_company', [])),
              activeSiteId: loginRes.default_site_id,
              activeClientCompanyId: loginRes.ac_active_client_company,
            })

            setFeatureFlag({
              isEstimator: loginRes.is_estimator_feature_required,
              isEgalvanicAI: loginRes.is_egalvanic_ai_required,
              isUpdateFormIO: loginRes.is_allowed_to_update_formio,
              isRequiredMaintenanceCommandCenter: loginRes.is_required_maintenance_command_center,
              isReactFlowSingleLine: loginRes?.is_reactflow_required,
            })

            $('#pageLoading').show()
            if (loginRes.default_rolename_web_name === enums.userRoles[0].role) {
              //manager

              if (defaultRoleData.length > 0) {
                // window.location.replace("/dashboard");
                history.push('/dashboard')
              }
            } else if (loginRes.default_rolename_web_name === enums.userRoles[4].role) {
              //exe
              //console.log('---------------------------------------------', defaultRoleData)
              if (defaultRoleData.length > 0) {
                // window.location.replace("/dashboard");
                history.push('/dashboard')
              }
            } else if (loginRes.default_rolename_web_name === enums.userRoles[1].role || loginRes.default_rolename_web_name === enums.userRoles[5].role) {
              //superAdmin & company admin
              if (defaultRoleData.length > 0) {
                // window.location.replace("/assets");
                history.push('/assets')
              }
            } else if (loginRes.default_rolename_web_name === enums.userRoles[6].role) {
              throw 'Technician user is not allowed to login'
            } else {
              tostMsg.msg = enums.resMessages.userInValid
              tostMsg.type = enums.toastMsgType[1].id

              // alert.errorMessage(enums.resMessages.userInValid);
            }
          } else {
            localStorage.setItem('authenticated', false)

            tostMsg.msg = response.data.message
            tostMsg.type = enums.toastMsgType[1].id

            // alert.errorMessage(response.data.message);
          }
          dispatch(success(response, tostMsg))
        })
        .catch(error => {
          $('#pageLoading').hide()
          localStorage.setItem('authenticated', false)
          dispatch(failure(error, tostMsg))
          localStorage.clear()
          history.push('/login')
          Toast.error(error || 'Something went wrong !')
        })
    }, 1000)
  }
  function request(loginData, tostMsg) {
    return { type: userConstants.LOGIN_REQUEST, loginData, tostMsg }
  }
  function success(loginData, tostMsg) {
    return { type: userConstants.LOGIN_SUCCESS, loginData, tostMsg }
  }
  function failure(error, tostMsg) {
    return { type: userConstants.LOGIN_FAILURE, error, tostMsg }
  }
}
