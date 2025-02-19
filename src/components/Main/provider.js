import { get, isEmpty } from 'lodash'
import React, { useState, createContext, useEffect } from 'react'
import { camelizeKeys } from 'helpers/formatters'
import { getApplicationStorageItem } from 'helpers/getStorageItem'
import $ from 'jquery'
import { Toast } from 'Snackbar/useToast'
import updateActiveSiteAction from 'Actions/updateActiveSiteAction'
import updateClientCompany from 'Services/updateClientCompany'
import UpdateActiveSiteService from 'Services/UpdateActiveSiteService'
import getUserRole from 'helpers/getUserRole'
export const MainContext = createContext()

const MainProvider = ({ children }) => {
  const checkUserRole = new getUserRole()
  const loginData = JSON.parse(localStorage.getItem('loginData'))

  const getSessionStorageItem = (key, defaultValue) => {
    const storedValue = sessionStorage.getItem(key)

    return storedValue !== null ? storedValue : defaultValue
  }

  const setSessionStorageItem = (key, value) => {
    const valueToStore = typeof value === 'string' ? value : JSON.stringify(value)
    sessionStorage.setItem(key, valueToStore)
  }
  const [counter, setCounter] = useState({})
  const [loginSiteData, setLoginSiteData] = useState({
    // roleName: getSessionStorageItem('roleName', localStorage.getItem('roleName')),
    // defaultroleName: getSessionStorageItem('defaultroleName', localStorage.getItem('defaultroleName')),
    siteName: getSessionStorageItem('siteName', localStorage.getItem('siteName')),
    defaultSiteName: getSessionStorageItem('defaultSiteName', localStorage.getItem('defaultSiteName')),
    companyName: getSessionStorageItem('companyName', localStorage.getItem('companyName')),
    defaultCompanyName: getSessionStorageItem('defaultCompanyName', localStorage.getItem('defaultCompanyName')),
    clientCompanyName: getSessionStorageItem('clientCompanyName', localStorage.getItem('clientCompanyName')),
    userroles: camelizeKeys(get(loginData, 'userroles', [])),
    client_company: camelizeKeys(get(loginData, 'client_company', [])),
    accessibleSites: [],
    activeSiteId: getSessionStorageItem('siteId', localStorage.getItem('siteId')),
    activeClientCompanyId: getSessionStorageItem('activeClientCompanyId', localStorage.getItem('activeClientCompanyId')),
  })
  const [refetchAppMenuContext, setRefetchAppMenuContext] = useState(false)
  const [notificationsCount, setNotificationsCount] = useState(0)
  const [featureFlag, setFeatureFlag] = useState({
    isEstimator: false,
    isEgalvanicAI: false,
    isUpdateFormIO: false,
    isRequiredMaintenanceCommandCenter: false,
    isReactFlowSingleLine: true,
  })
  const [mfaUser, setMFAUser] = useState(null)

  useEffect(() => {
    // Save state to sessionStorage
    Object.keys(loginSiteData).forEach(key => {
      setSessionStorageItem(key, loginSiteData[key])
    })
    if (localStorage.getItem('siteId') !== null && sessionStorage.getItem('siteId') === null) {
      sessionStorage.setItem('siteId', localStorage.getItem('siteId'))
    }
    if (localStorage.getItem('roleId') !== null && sessionStorage.getItem('roleId') === null) {
      sessionStorage.setItem('roleId', localStorage.getItem('roleId'))
    }
  }, [loginSiteData])

  // change site
  const handleSiteRadioClick = ({ siteId, siteName }, accessibleSites) => {
    $('#pageLoading').show()
    updateActiveSiteAction({ site_id: siteId })
      .then(response => {
        localStorage.setItem('siteId', siteId)
        localStorage.setItem('siteName', siteName)
        sessionStorage.setItem('siteId', siteId)
        sessionStorage.setItem('siteName', siteName)
        setLoginSiteData(prevState => ({
          ...prevState,
          siteName: siteName,
          activeSiteId: siteId,
          accessibleSites,
        }))
        $('#pageLoading').hide()
        Toast.success(' The current site is inactive and has been changed. You will be redirected to an active site.')
      })
      .catch(error => {
        $('#pageLoading').hide()
        Toast.error(error.tostMsg.msg)
      })
  }

  // change compnay
  const changeClientCompany = async comp => {
    $('#pageLoading').show()
    try {
      const { siteId, siteName } = comp.clientCompanyUsersites[0]
      const cc = await updateClientCompany({ company_id: comp.clientCompanyId, site_id: siteId })
      const ac = await UpdateActiveSiteService({ site_id: siteId })

      Toast.success('The current client company is inactive and has been changed. You will be redirected to an active client company.')

      setLoginSiteData(prevState => ({
        ...prevState,
        accessibleSites: comp.clientCompanyUsersites,
        activeClientCompanyId: comp.clientCompanyId,
        clientCompanyName: comp.clientCompanyName,
        activeSiteId: siteId,
        siteName: siteName,
      }))

      localStorage.setItem('clientCompanyName', comp.clientCompanyName)
      localStorage.setItem('siteId', siteId)
      localStorage.setItem('siteName', siteName)
      localStorage.setItem('activeClientCompanyId', comp.clientCompanyId)
      sessionStorage.setItem('clientCompanyName', comp.clientCompanyName)
      sessionStorage.setItem('siteId', siteId)
      sessionStorage.setItem('siteName', siteName)
      sessionStorage.setItem('activeClientCompanyId', comp.clientCompanyId)
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong!')
    }
    $('#pageLoading').hide()
  }

  useEffect(() => {
    const handleStorageEvent = event => {
      if (event.key === 'headerDataUpdate' && checkUserRole.isSuperAdmin()) {
        setRefetchAppMenuContext(true)
      } else if (event.key === 'headerDataUpdate' && localStorage.getItem('loginData') && isJson(localStorage.getItem('loginData'))) {
        setLoginSiteData(prevState => {
          console.log('Facility update in another tab. event - headerDataUpdate execute')
          const updatedStorageData = JSON.parse(localStorage.getItem('loginData'))
          const updatedLoginSiteData = {
            ...prevState,
          }
          // console.log('Client company - ', get(updatedStorageData, 'client_company', []))

          const clientCompany = get(updatedStorageData, 'client_company', []).find(d => d.client_company_id === getApplicationStorageItem('activeClientCompanyId'))
          const userAccessibleSites = !isEmpty(clientCompany) ? camelizeKeys(get(clientCompany, 'client_company_Usersites', [])) : []
          const currentActiveSite = userAccessibleSites.find(e => e.siteId === getApplicationStorageItem('siteId'))
          updatedLoginSiteData.client_company = camelizeKeys(get(updatedStorageData, 'client_company', []))
          updatedLoginSiteData.accessibleSites = userAccessibleSites
          updatedLoginSiteData.activeClientCompanyId = get(clientCompany, 'client_company_id', prevState.activeClientCompanyId)
          updatedLoginSiteData.clientCompanyName = get(clientCompany, 'client_company_name', prevState.clientCompanyName)
          updatedLoginSiteData.activeSiteId = get(currentActiveSite, 'siteId', prevState.activeSiteId)
          updatedLoginSiteData.siteName = get(currentActiveSite, 'siteName', prevState.siteName)
          sessionStorage.setItem('siteId', get(currentActiveSite, 'siteId', prevState.activeSiteId))
          if (!isEmpty(userAccessibleSites) && !userAccessibleSites.some(e => e.siteId === updatedLoginSiteData.activeSiteId)) {
            handleSiteRadioClick(userAccessibleSites[0], userAccessibleSites)
          }
          if (isEmpty(clientCompany)) {
            changeClientCompany(get(updatedLoginSiteData, 'client_company', [])[0])
          }
          return updatedLoginSiteData
        })
      }
    }

    window.addEventListener('storage', handleStorageEvent)

    return () => {
      window.removeEventListener('storage', handleStorageEvent)
    }
  }, [])

  const isJson = str => {
    try {
      JSON.stringify(JSON.parse(str))
      return true
    } catch (e) {
      return false
    }
  }

  return <MainContext.Provider value={{ counter, setCounter, loginSiteData, setLoginSiteData, refetchAppMenuContext, setRefetchAppMenuContext, notificationsCount, setNotificationsCount, mfaUser, setMFAUser, featureFlag, setFeatureFlag }}>{children}</MainContext.Provider>
}

export default MainProvider
