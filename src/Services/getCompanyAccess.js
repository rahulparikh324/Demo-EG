import $ from 'jquery'
import { get } from 'lodash'
import { getApplicationStorageItem } from 'helpers/getStorageItem'
import updateActiveSiteAction from 'Actions/updateActiveSiteAction'
import updateClientCompany from 'Services/updateClientCompany'
import UpdateActiveSiteService from 'Services/UpdateActiveSiteService'
import { history } from 'helpers/history'
import { Toast } from 'Snackbar/useToast'

export const handleCompanyAccess = ({ companyId, siteId, companyName, siteName }, context, module = '') => {
  const { setLoginSiteData, loginSiteData } = context

  const showLoading = show => {
    $('#pageLoading').toggle(show)
  }

  const updateLocalAndSessionStorage = data => {
    const { clientCompanyName, siteId, siteName, activeClientCompanyId } = data
    if (clientCompanyName) {
      localStorage.setItem('clientCompanyName', clientCompanyName)
      sessionStorage.setItem('clientCompanyName', clientCompanyName)
    }
    if (siteId) {
      localStorage.setItem('siteId', siteId)
      sessionStorage.setItem('siteId', siteId)
    }
    if (siteName) {
      localStorage.setItem('siteName', siteName)
      sessionStorage.setItem('siteName', siteName)
    }
    if (activeClientCompanyId) {
      localStorage.setItem('activeClientCompanyId', activeClientCompanyId)
      sessionStorage.setItem('activeClientCompanyId', activeClientCompanyId)
    }
  }

  const handleSiteChange = async ({ siteId, siteName }, accessibleSites) => {
    showLoading(true)
    try {
      await updateActiveSiteAction({ site_id: siteId })
      updateLocalAndSessionStorage({ siteId, siteName })

      setLoginSiteData(prevState => ({
        ...prevState,
        siteName,
        activeSiteId: siteId,
        accessibleSites,
      }))

      // Toast.success(' The current site is inactive and has been changed. You will be redirected to an active site.')
    } catch (error) {
      console.error('Error changing site:', error)
      // Toast.error(error.tostMsg.msg);
    } finally {
      showLoading(false)
    }
  }

  const changeClientCompany = async company => {
    showLoading(true)
    try {
      // const { siteId, siteName } = company.clientCompanyUsersites[0]
      await updateClientCompany({ company_id: company.clientCompanyId, site_id: siteId })
      await UpdateActiveSiteService({ site_id: siteId })

      updateLocalAndSessionStorage({
        clientCompanyName: company.clientCompanyName,
        siteId,
        siteName,
        activeClientCompanyId: company.clientCompanyId,
      })

      setLoginSiteData(prevState => ({
        ...prevState,
        accessibleSites: company.clientCompanyUsersites,
        activeClientCompanyId: company.clientCompanyId,
        clientCompanyName: company.clientCompanyName,
        siteName,
        activeSiteId: siteId,
      }))

      // Toast.success('The current client company is inactive and has been changed. You will be redirected to an active client company.')
    } catch (error) {
      console.error('Error changing client company:', error)
      // Toast.error('Something went wrong!');
    } finally {
      showLoading(false)
    }
  }

  const clientCompany = get(loginSiteData, 'client_company', []).find(company => company.clientCompanyId === getApplicationStorageItem('activeClientCompanyId'))

  const clientCompanyUsersites = clientCompany ? clientCompany.clientCompanyUsersites : []
  const validUserIds = get(loginSiteData, 'client_company', []).map(company => company.clientCompanyId)
  const validUserSiteIds = get(loginSiteData, 'client_company', [])
    .flatMap(d => d.clientCompanyUsersites)
    .flatMap(v => v.siteId)

  if (validUserIds.includes(companyId)) {
    if (validUserSiteIds.includes(siteId)) {
      if (loginSiteData.activeClientCompanyId !== companyId) {
        const currentCompany = get(loginSiteData, 'client_company', []).find(company => company.clientCompanyId === companyId)
        changeClientCompany(currentCompany)
      } else if (loginSiteData.activeSiteId !== siteId) {
        handleSiteChange({ siteId, siteName }, clientCompanyUsersites)
      }
    } else {
      Toast.warning(`This ${module} is not assign to you`)
      history.push(process.env.PUBLIC_URL + '/assets')
    }
  }
}
