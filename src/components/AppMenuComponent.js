import React, { useEffect, useState, useContext } from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import Container from '@material-ui/core/Container'
import { makeStyles } from '@material-ui/core/styles'
import MainDrawer from './Main/MainDrawerComponent'
import Title from './TitleComponent'
import Grid from '@material-ui/core/Grid'
import enums from '../Constants/enums'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import AccountCircleOutlined from '@material-ui/icons/AccountCircleOutlined'
import _, { isEmpty, orderBy } from 'lodash'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import PersonOutlined from '@material-ui/icons/PersonOutlined'
import Radio from '@material-ui/core/Radio'
import { history } from '../helpers/history'
import updateDefaultRole from '../Actions/updateDefaultRoleAction'
import updateActiveSiteAction from '../Actions/updateActiveSiteAction'
import updateActiveRoleAction from '../Actions/updateActiveRoleAction'
import $ from 'jquery'
import { Toast } from '../Snackbar/useToast'
import getAllCompanyWithSites from '../Services/getAllCompanyWithSites'
import getUserRole from '../helpers/getUserRole'
import updateActiveCompany from '../Services/updateActiveCompany.service'
import PowerSettingNewOutlined from '@material-ui/icons/PowerSettingsNewOutlined'
import { handleNewRole } from '../helpers/handleNewRole'
import './Notification/notification.css'
import updateClientCompany from '../Services/updateClientCompany'
import UpdateActiveSiteService from '../Services/UpdateActiveSiteService'
import getActiveUserSitesAndRoles from 'Services/facilities/get-usersites-roles'
import getLogoName from 'helpers/getLogoName'

import ErrorBoundary from 'components/error-boundary'
import RadioDropdown from 'components/common/custom-radio-dropdown'
import UserMenu from 'components/common/user-menu'
import Notification from 'components/notifications'

import { get } from 'lodash'
import { NotificationCount } from 'components/notifications/utils'

import { MainContext } from 'components/Main/provider'
import { camelizeKeys } from 'helpers/formatters'
import { getApplicationStorageItem } from 'helpers/getStorageItem'
import QuickAssist from './QuickAssist/quick-assist'
import { CustomCompanyAndSiteTooltip } from './WorkOrders/onboarding/utils'
import CheckboxDropdown from './common/checkbox-dropdown'
import { useTheme } from '@material-ui/core/styles'

export const WithTitle = props => {
  const Body = props.bodyComponent
  return (
    <React.Fragment>
      <Title title={props.title} />
      <MainMenu pageTitle={props.pageTitle} body={() => <Body {...props} />} userRole={props.userRole} />
    </React.Fragment>
  )
}

const useStyles = makeStyles(theme => ({
  root: { display: 'flex', backgroundColor: '#fafafa' },
  drawer: {
    zIndex: 10,
    background: '#EEEEEE',
    height: '100vh',
  },
  appBar: {
    [theme.breakpoints.up('sm')]: { width: `calc(100% )` },
    boxShadow: 'none',
  },
  title: { fontWeight: 800, fontFamily: 'Manrope-Medium', fontSize: '16px' },
  toolbar: theme.mixins.toolbar,
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('sm')]: { display: 'none' },
  },
  notificationButton: { paddingRight: '0' },
  content: { flexGrow: 1, padding: theme.spacing(2) },
  drpmenuFont: { fontSize: '0.875rem', fontWeight: 'bold', paddingTop: '2px', paddingBottom: '0px', paddingLeft: '8px', cursor: 'default' },
  drpmenuItemFont: { fontSize: '0.875rem', fontWeight: '400', paddingTop: '0px', paddingBottom: '0px', paddingLeft: '7px', paddingRight: '10px', cursor: 'default', '&:hover': { background: 'none' } },
  useremail: { flexGrow: 1, float: 'right', fontSize: '0.875rem', fontWeight: '400' },
  list: { width: '200px !important' },
  badge: { transform: 'scale(0.8) translate(50%, -50%)' },
  name: { fontWeight: 800, fontFamily: 'EudoxusSans-Regular' },
  menuPaper: { width: '325px !important', maxWidth: '325px !important' },
  menuList: { paddingTop: '0 !important' },
  companyMenuPaper: { width: '275px !important', maxWidth: '275px !important', maxHeight: '400px !important', '&:ul': { paddingTop: 0 } },
  navBg: { background: theme.palette.primary.main },
}))

function MainMenu(props) {
  const classes = useStyles()
  const checkUserRole = new getUserRole()
  const [accessibleRoles, setAccessibleRoles] = React.useState([])
  const [accessibleCompanies, setAccessibleCompanies] = useState([])
  const [accessibleSites, setAccessibleSites] = useState([])
  const theme = useTheme()
  const nameLogo = getLogoName()
  const { body: Body } = props
  const logindata = JSON.parse(localStorage.getItem('loginData'))
  const [drawerWidth, setDrawerWidth] = useState(localStorage.getItem('drawerWidth') || 250)
  const [isNotificationOpen, setNotificationOpen] = useState(false)
  const { loginSiteData, setLoginSiteData, refetchAppMenuContext, setRefetchAppMenuContext, notificationsCount, featureFlag } = useContext(MainContext)
  const [hasCompanyAndSiteData, setHasCompanyAndSiteData] = useState(false)
  const [loading, setLoading] = useState(false)

  // start menu code
  const [anchorEl, setAnchorEl] = React.useState(null)

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const getTotalSiteSelected = () => {
    let totalSite = []
    const clientCompany = get(logindata, 'client_company', [])
    const userSites = get(logindata, 'usersites', [])

    if (!isEmpty(userSites)) {
      userSites.forEach(site => {
        const clientCompanyName = clientCompany.filter(d => d.client_company_id.includes(site.client_company_id))
        if (site.status !== 20) {
          const companyData = { ...site, client_company_name: clientCompanyName[0]?.client_company_name }
          totalSite.push({ ...companyData, label: `${clientCompanyName[0]?.client_company_name} -> ${site.site_name}` })
        }
      })
    }

    totalSite = orderBy(totalSite, [s => s.label.toLowerCase()], ['asc'])
    return totalSite
  }

  const getTotalSite = () => {
    let totalSite = []
    const clientSite = getTotalSiteSelected()
    if (!isEmpty(clientSite)) {
      clientSite.forEach(siteData => {
        totalSite = [...totalSite, siteData.site_id]
      })
    }

    if (!JSON.parse(localStorage.getItem('siteListForWO'))) {
      localStorage.setItem('siteListForWO', JSON.stringify(totalSite))
    }
    return totalSite
  }

  const [hasFacilityFilter, setHasFacilityFilter] = useState(false)
  const [isSiteDropDownOpen, setIsSiteDropDownOpen] = useState(false)
  const [selectedSiteMenu, setSelectedSiteMenu] = useState(JSON.parse(localStorage.getItem('siteListForWO')) ? JSON.parse(localStorage.getItem('siteListForWO')) : getTotalSite())

  const [selectedRole, setselectedRole] = React.useState(sessionStorage.getItem('roleName') ?? localStorage.getItem('roleName'))
  const [selectedDefaultRole, setselectedDefaultRole] = React.useState(sessionStorage.getItem('defaultroleName') ?? sessionStorage.getItem('defaultroleName'))

  const [selectedSite, setselectedSite] = React.useState(get(loginSiteData, 'siteName', ''))
  const [selectedCompany, setSelectedCompany] = useState(get(loginSiteData, 'companyName', ''))

  const [selectedClientCompany, setSelectedClientCompany] = useState(get(loginSiteData, 'clientCompanyName', ''))

  const AdminAccessibleSites = [
    '/assets',
    '/asset-classes',
    '/hierarchy',
    '/locations',
    '/inspection-forms',
    '/devices',
    '/users',
    '/vendors',
    '/preventative-maintenance',
    '/cluster',
    '/preventative-maintenance-config',
    '/equipments',
    '/facilities',
    '/profile',
    '/issues',
    '/reviews',
    '/business-overview',
    '/dashboard-maintenance',
    '/asset-overview',
    '/nfpa-70b-compliance',
    '/nfpa-70e-compliance',
    '/quote',
    '/workorders',
    '/documents',
    '/health',
  ]
  const ManagerAccessibleSites = ['/dashboard', '/assets', '/hierarchy', '/locations', '/cluster', '/issues', '/quickinsights', '/workorders', '/users', '/preventative-maintenance', '/equipments', '/profile', '/reviews', '/nfpa-70b-compliance', '/nfpa-70e-compliance', '/dashboard-maintenance', '/quote', '/documents', '/health']
  const ClientAccessibleSites = ['/dashboard', '/assets', '/locations', '/cluster', '/profile', '/issues', '/workorders', '/nfpa-70b-compliance', '/nfpa-70e-compliance', '/asset-overview']
  const superAdminAccessibleSites = ['/assets', '/equipments', '/devices', '/users', '/profile', '/facilities', '/preventative-maintenance-config', '/settings']
  const notAllowCompanyAndSitesAccess = ['/business-overview', '/asset-overview', '/asset-classes', '/inspection-forms', '/preventative-maintenance-config', '/equipments', '/facilities', '/devices', '/vendors']

  if (featureFlag.isEgalvanicAI) {
    ManagerAccessibleSites.push('/ai-builder')
    AdminAccessibleSites.push('/ai-builder')
  }

  const viewUserProfile = () => {
    history.push('/profile')
  }

  if (featureFlag.isEstimator) {
    ManagerAccessibleSites.push('/estimator')
    AdminAccessibleSites.push('/estimator')
  }

  if (featureFlag.isRequiredMaintenanceCommandCenter) {
    ManagerAccessibleSites.push('/maintenance-command-center')
    AdminAccessibleSites.push('/maintenance-command-center')
  }

  sessionStorage.setItem('roleName', selectedRole)
  sessionStorage.setItem('defaultroleName', selectedDefaultRole)

  const logOut = async () => {
    $('#pageLoading').show()
    try {
      const domainName = localStorage.getItem('domainName')
      //await logout()
      localStorage.clear()
      localStorage.setItem('domainName', domainName)
      history.push('/login')
      $('#pageLoading').hide()
    } catch (error) {
      console.log(error)
      $('#pageLoading').hide()
      history.push('/login')
    }
  }
  useEffect(() => {
    const roles = []
    const _roles = []
    get(logindata, 'userroles', []).forEach(role => {
      roles.push(role.role_name)
      _roles.push({ ...role, roleName: handleNewRole(role.role_name) })
    })
    ;(async () => {
      if (checkUserRole.isSuperAdmin()) {
        const activeCompanyID = getApplicationStorageItem('companyId')
        const allCompaniesList = await getAllCompanyWithSites()
        const companyList = camelizeKeys(allCompaniesList)
        setAccessibleCompanies(companyList.data.data)
        const allSites = companyList.data.data.filter(comp => comp.companyId === activeCompanyID)[0].sites
        const currentSite = allSites.find(e => e.siteId === getApplicationStorageItem('siteId'))

        setLoginSiteData({ ...loginSiteData, accessibleSites: allSites })

        let sites = []
        if (!isEmpty(companyList.data.data)) {
          companyList.data.data.forEach(company => {
            const siteList = get(company, 'sites', [])
            if (!isEmpty(siteList)) {
              siteList.forEach(site => {
                if (site.status !== 20) {
                  const companyData = { companyName: company.companyName, companyId: company.companyId, siteId: site.siteId, siteName: site.siteName }
                  sites.push({ ...companyData, label: `${company.companyName} -> ${site.siteName}`, value: site.siteId })
                }
              })
            }
          })
        }

        sites = orderBy(sites, [s => s.label.toLowerCase()], ['asc'])
        setAccessibleSites(sites)

        if (_.isEmpty(currentSite)) {
          const { companyName, companyId, siteId, siteName } = sites[0]
          $('#pageLoading').show()
          updateActiveSiteAction({ site_id: siteId })
            .then(response => {
              localStorage.setItem('companyId', companyId)
              localStorage.setItem('companyName', companyName)
              localStorage.setItem('siteId', siteId)
              localStorage.setItem('siteName', siteName)

              sessionStorage.setItem('companyId', companyId)
              sessionStorage.setItem('companyName', companyName)
              sessionStorage.setItem('siteId', siteId)
              sessionStorage.setItem('siteName', siteName)

              setLoginSiteData({ ...loginSiteData, activeClientCompanyId: companyId, companyName: companyName, siteName: siteName, activeSiteId: siteId, siteId: siteId })

              setSelectedCompany(companyName)
              setselectedSite(siteName)

              $('#pageLoading').hide()
              Toast.success(' The current site is inactive and has been changed. You will be redirected to an active site.')
              const currentPath = window.location.pathname.split('/').length === 3 && window.location.pathname.split('/')[1].includes('reviews') ? window.location.pathname : '/' + window.location.pathname.split('/')[1]
              history.push(process.env.PUBLIC_URL + currentPath)
            })
            .catch(error => {
              $('#pageLoading').hide()
              Toast.error(error.tostMsg.msg)
            })
        }
      } else {
        try {
          const company = get(loginSiteData, 'client_company', []).find(d => d.clientCompanyName === selectedClientCompany)
          const sites = _.orderBy(_.get(company, 'clientCompanyUsersites', []), [d => d.siteName && d.siteName.toLowerCase()], 'asc')
          setLoginSiteData({ ...loginSiteData, accessibleSites: sites })
          setAccessibleSites(sites)
        } catch (error) {}
      }
    })()
    setAccessibleRoles(roles)
    // check accessible routes
    const currentPath = window.location.pathname.split('/').length === 3 && window.location.pathname.split('/')[1].includes('reviews') ? window.location.pathname : '/' + window.location.pathname.split('/')[1]
    if (checkUserRole.isExecutive() && !ClientAccessibleSites.includes(currentPath)) history.push(process.env.PUBLIC_URL + '/assets')
    if (checkUserRole.isManager() && !ManagerAccessibleSites.includes(currentPath)) history.push(process.env.PUBLIC_URL + '/assets')
    if (checkUserRole.isCompanyAdmin() && !AdminAccessibleSites.includes(currentPath)) history.push(process.env.PUBLIC_URL + '/assets')
    if (checkUserRole.isSuperAdmin() && !superAdminAccessibleSites.includes(currentPath)) history.push(process.env.PUBLIC_URL + '/assets')

    if (!currentPath.startsWith('/quote') && !/^\/workorders\/\w+/.test(window.location.pathname)) {
      localStorage.removeItem('selectedSiteId')
    }

    if (['/quote', '/workorders'].includes(currentPath)) {
      setHasFacilityFilter(window.location.pathname.split('/').length === 2)
    } else {
      setHasFacilityFilter(false)
    }

    if (!notAllowCompanyAndSitesAccess.includes(currentPath)) {
      if (['/quote', '/workorders'].includes(currentPath) && window.location.pathname.split('/').length === 2) {
        setHasCompanyAndSiteData(false)
      } else {
        setHasCompanyAndSiteData(true)
      }
    } else {
      setHasCompanyAndSiteData(false)
    }
  }, [])

  useEffect(() => {
    // Call API for update super admin sites options
    if (refetchAppMenuContext === true && checkUserRole.isSuperAdmin()) {
      console.log('refetch app menu sites for superadmin')
      ;(async () => {
        setRefetchAppMenuContext(false)
        const activeCompanyID = localStorage.getItem('companyId')
        const allCompaniesList = await getAllCompanyWithSites()
        const companyList = camelizeKeys(allCompaniesList)
        setAccessibleCompanies(companyList.data.data)
        const allSites = companyList.data.data.filter(comp => comp.companyId === activeCompanyID)[0].sites
        const currentSite = allSites.find(e => e.siteId === getApplicationStorageItem('siteId'))

        let sites = []
        if (!isEmpty(companyList.data.data)) {
          companyList.data.data.forEach(company => {
            const siteList = get(company, 'sites', [])
            if (!isEmpty(siteList)) {
              siteList.forEach(site => {
                if (site.status !== 20) {
                  const companyData = { companyName: company.companyName, companyId: company.companyId, siteId: site.siteId, siteName: site.siteName }
                  sites.push({ ...companyData, label: `${company.companyName} -> ${site.siteName}`, value: site.siteId })
                }
              })
            }
          })
        }

        sites = orderBy(sites, [s => s.label.toLowerCase()], ['asc'])
        setAccessibleSites(sites)

        if (!_.isEmpty(currentSite)) {
          setselectedSite(currentSite.siteName)
          localStorage.setItem('siteName', currentSite.siteName)
          sessionStorage.setItem('siteName', currentSite.siteName)
          setLoginSiteData({ ...loginSiteData, siteName: currentSite.siteName, accessibleSites: allSites })
        } else {
          if (!_.isEmpty(sites)) {
            const { companyName, companyId, siteId, siteName } = sites[0]
            $('#pageLoading').show()
            updateActiveSiteAction({ site_id: siteId })
              .then(response => {
                localStorage.setItem('companyId', companyId)
                localStorage.setItem('companyName', companyName)
                localStorage.setItem('siteId', siteId)
                localStorage.setItem('siteName', siteName)

                sessionStorage.setItem('companyId', companyId)
                sessionStorage.setItem('companyName', companyName)
                sessionStorage.setItem('siteId', siteId)
                sessionStorage.setItem('siteName', siteName)

                setLoginSiteData({ ...loginSiteData, activeClientCompanyId: companyId, companyName: companyName, siteName: siteName, activeSiteId: siteId, siteId: siteId })

                setSelectedCompany(companyName)
                setselectedSite(siteName)

                $('#pageLoading').hide()
                Toast.success(' The current site is inactive and has been changed. You will be redirected to an active site.')
                const currentPath = window.location.pathname.split('/').length === 3 && window.location.pathname.split('/')[1].includes('reviews') ? window.location.pathname : '/' + window.location.pathname.split('/')[1]
                history.push(process.env.PUBLIC_URL + currentPath)
              })
              .catch(error => {
                $('#pageLoading').hide()
                Toast.error(error.tostMsg.msg)
              })
          }
          setLoginSiteData({ ...loginSiteData, accessibleSites: allSites })
        }
      })()
    }
  }, [refetchAppMenuContext])

  const handleRadioClick = role => {
    var role_id = null
    get(logindata, 'userroles', []).map((value, key) => {
      if (value.role_name === role) {
        role_id = value.role_id
      }
    })

    //console.log(localStorage.getItem('roleName'))
    const platform = 2
    setselectedRole(role)
    $('#pageLoading').show()
    updateActiveRoleAction({ platform, role_id })
      .then(response => {
        $('#pageLoading').hide()
        localStorage.setItem('roleId', role_id)
        localStorage.setItem('roleName', role)
        sessionStorage.setItem('roleId', role_id)
        sessionStorage.setItem('roleName', role)
        setLoginSiteData({ ...loginSiteData, roleName: role })
        const currentPath = window.location.pathname.split('/').length === 3 && window.location.pathname.split('/')[1].includes('reviews') ? window.location.pathname : '/' + window.location.pathname.split('/')[1]
        setTimeout(() => {
          if (role === enums.userRoles[5].role) {
            AdminAccessibleSites.includes(currentPath) ? history.push(process.env.PUBLIC_URL + currentPath) : history.push(process.env.PUBLIC_URL + '/assets')
          } else if (role === enums.userRoles[0].role) {
            ManagerAccessibleSites.includes(currentPath) ? history.push(process.env.PUBLIC_URL + currentPath) : history.push(process.env.PUBLIC_URL + '/assets')
          } else if (role === enums.userRoles[4].role) {
            ClientAccessibleSites.includes(currentPath) ? history.push(process.env.PUBLIC_URL + currentPath) : history.push(process.env.PUBLIC_URL + '/assets')
          } else {
            history.push(process.env.PUBLIC_URL + '/assets')
          }
        }, 500)
        setAnchorEl(null)
      })
      .catch(error => {
        $('#pageLoading').hide()
        setAnchorEl(null)
      })
  }

  const handleDefaultRadionClick = role => {
    setselectedDefaultRole(role)
    var roleid = null
    get(logindata, 'userroles', []).map((value, key) => {
      if (value.role_name == role) {
        roleid = value.role_id
      }
    })

    localStorage.setItem('defaultroleId', roleid)
    localStorage.setItem('defaultroleName', role)
    setLoginSiteData({ ...loginSiteData, defaultroleName: role })
    var requestData = {
      requested_by: logindata.uuid,
      user_id: logindata.uuid,
      role_id: roleid,
      platform: enums.platform,
    }
    $('#pageLoading').show()
    updateDefaultRole(requestData)
      .then(response => {
        $('#pageLoading').hide()
        setAnchorEl(null)
      })
      .catch(error => {
        $('#pageLoading').hide()
        setAnchorEl(null)
      })
  }

  const handleSiteRadioClickForSuper = async ({ companyName, companyId, siteId, siteName }) => {
    $('#pageLoading').show()
    setAnchorEl(null)
    const response = await updateActiveCompany({ company_id: companyId, site_id: siteId })
    if (response.data.success) {
      await updateActiveSiteAction({ site_id: siteId })
        .then(response => {
          Toast.success('Facility updated successfully !')

          setSelectedCompany(companyName)
          setselectedSite(siteName)

          localStorage.setItem('companyId', companyId)
          localStorage.setItem('companyName', companyName)
          localStorage.setItem('siteId', siteId)
          localStorage.setItem('siteName', siteName)

          sessionStorage.setItem('companyId', companyId)
          sessionStorage.setItem('companyName', companyName)
          sessionStorage.setItem('siteId', siteId)
          sessionStorage.setItem('siteName', siteName)

          const allSites = accessibleCompanies.filter(comp => comp.companyId === companyId)[0].sites
          setLoginSiteData({ ...loginSiteData, accessibleSites: allSites, activeClientCompanyId: companyId, companyName: companyName, siteName: siteName, activeSiteId: siteId, siteId: siteId })
          setAccessibleSites(allSites)

          $('#pageLoading').hide()
          const currentPath = window.location.pathname.split('/').length === 3 && window.location.pathname.split('/')[1].includes('reviews') ? window.location.pathname : '/' + window.location.pathname.split('/')[1]
          if (checkUserRole.isSuperAdmin() || checkUserRole.isExecutive() || checkUserRole.isCompanyAdmin()) {
            // history.push(process.env.PUBLIC_URL + '/assets')
            history.push(process.env.PUBLIC_URL + currentPath)
          } else {
            history.push(process.env.PUBLIC_URL + currentPath)
            // history.push(process.env.PUBLIC_URL + '/dashboard')
          }
        })
        .catch(error => {
          $('#pageLoading').hide()
          //console.log(error.tostMsg.msg)
          Toast.error(error.tostMsg.msg)
        })
    }
    $('#pageLoading').hide()
  }

  const handleSiteRadioClick = async comp => {
    const siteId = comp.site_id
    const siteName = comp.site_name
    const clientCompanyName = comp.client_company_name
    const activeClientCompanyId = comp.client_company_id

    $('#pageLoading').show()
    try {
      const cc = await updateClientCompany({ company_id: activeClientCompanyId, site_id: siteId })
      const ac = await UpdateActiveSiteService({ site_id: siteId })

      if (cc?.data?.success > 0 && ac?.data?.success > 0) {
        Toast.success('Facility updated successfully !')
        setSelectedClientCompany(clientCompanyName)

        localStorage.setItem('clientCompanyName', clientCompanyName)
        localStorage.setItem('siteId', siteId)
        localStorage.setItem('siteName', siteName)
        localStorage.setItem('activeClientCompanyId', activeClientCompanyId)

        sessionStorage.setItem('clientCompanyName', clientCompanyName)
        sessionStorage.setItem('siteId', siteId)
        sessionStorage.setItem('siteName', siteName)
        sessionStorage.setItem('activeClientCompanyId', activeClientCompanyId)

        setLoginSiteData({ ...loginSiteData, clientCompanyName: clientCompanyName, activeClientCompanyId: activeClientCompanyId, activeSiteId: siteId, siteName: siteName, siteId: siteId })

        const currentPath = window.location.pathname.split('/').length === 3 ? window.location.pathname : '/' + window.location.pathname.split('/')[1]
        history.push(process.env.PUBLIC_URL + currentPath)
      }
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
    }
    $('#pageLoading').hide()
  }

  const getSiteOpts = () => {
    const { usersites, client_company } = logindata
    let sites = []
    if (!isEmpty(usersites)) {
      usersites.forEach(s => {
        const clientCompanyName = client_company.filter(d => d.client_company_id.includes(s.client_company_id))
        if (s.status !== 20) {
          const companyData = { ...s, client_company_name: clientCompanyName[0]?.client_company_name }
          sites.push({ ...companyData, label: `${clientCompanyName[0]?.client_company_name} -> ${s.site_name}`, value: s.site_id })
        }
      })
    }

    sites = orderBy(sites, [s => s.label.toLowerCase()], ['asc'])
    return sites
  }

  const handleSiteChange = async siteData => {
    const { siteId, siteName, clientCompanyId } = siteData

    $('#pageLoading').show()
    await updateActiveSiteAction({ site_id: siteId })
      .then(response => {
        const { client_company } = logindata
        const clientCompanyName = client_company.filter(d => d.client_company_id.includes(clientCompanyId))

        localStorage.setItem('siteId', siteId)
        localStorage.setItem('siteName', siteName)
        localStorage.setItem('activeClientCompanyId', clientCompanyId)
        localStorage.setItem('clientCompanyName', clientCompanyName[0].client_company_name)

        sessionStorage.setItem('siteId', siteId)
        sessionStorage.setItem('siteName', siteName)
        sessionStorage.setItem('activeClientCompanyId', clientCompanyId)
        sessionStorage.setItem('clientCompanyName', clientCompanyName[0].client_company_name)

        setLoginSiteData(prevState => ({
          ...prevState,
          siteName: siteName,
          activeSiteId: siteId,
          siteId: siteId,
          activeClientCompanyId: clientCompanyId,
          clientCompanyName: clientCompanyName[0].client_company_name,
        }))

        $('#pageLoading').hide()
        Toast.success('The current facility is inactive and has been changed. You will be redirected to an active facility.')
      })
      .catch(error => {
        $('#pageLoading').hide()
        Toast.error(error.tostMsg.msg)
      })
  }

  const getUserFacilitiesData = async () => {
    try {
      setLoading(true)
      const res = await getActiveUserSitesAndRoles(get(logindata, 'uuid', ''))
      setLoading(false)
      if (res.success > 0) {
        const data = camelizeKeys(res.data)
        const clientCompany = get(data, 'clientCompany', []).find(d => d.clientCompanyId === getApplicationStorageItem('activeClientCompanyId'))
        const clientCompanyUsersites = !isEmpty(clientCompany) > 0 ? clientCompany.clientCompanyUsersites : []
        const currentActiveSite = get(data, 'usersites', []).find(e => e.siteId === getApplicationStorageItem('siteId'))

        setLoginSiteData(prevState => {
          const updatedLoginSiteData = {
            ...prevState,
            defaultSiteName: get(data, 'defaultSiteName', ''),
            companyName: get(prevState, 'companyName', localStorage.getItem('companyName')),
            defaultCompanyName: get(prevState, 'defaultCompanyName', localStorage.getItem('defaultCompanyName')),
            userroles: get(data, 'userroles', []),
            client_company: get(data, 'clientCompany', []),
            accessibleSites: clientCompanyUsersites,
            activeClientCompanyId: get(clientCompany, 'clientCompanyId', prevState.activeClientCompanyId),
            clientCompanyName: get(clientCompany, 'clientCompanyName', prevState.clientCompanyName),
            activeSiteId: get(currentActiveSite, 'siteId', prevState.activeSiteId),
            siteName: get(currentActiveSite, 'siteName', prevState.siteName),
          }

          // // Update session storage
          Object.keys(updatedLoginSiteData).forEach(key => {
            sessionStorage.setItem(key, JSON.stringify(updatedLoginSiteData[key]))
          })
          sessionStorage.setItem('siteId', get(currentActiveSite, 'siteId', prevState.activeSiteId))
          //need to update localstorage as well due to when do open in new tab its taking new context state which will default take from localstorage
          localStorage.setItem('clientCompanyName', get(clientCompany, 'clientCompanyName', prevState.clientCompanyName))
          localStorage.setItem('activeClientCompanyId', get(clientCompany, 'clientCompanyId', prevState.activeClientCompanyId))
          localStorage.setItem('siteId', get(currentActiveSite, 'siteId', prevState.activeSiteId))
          localStorage.setItem('siteName', get(currentActiveSite, 'siteName', prevState.siteName))

          if (!isEmpty(get(data, 'usersites', [])) && !get(data, 'usersites', []).some(e => e.siteId === updatedLoginSiteData.activeSiteId)) {
            handleSiteChange(get(data, 'usersites', [])[0])
          }

          if (!isEmpty(get(res, 'data.usersites', []))) {
            const loginData = JSON.parse(localStorage.getItem('loginData'))
            const updatedLoginData = {
              ...loginData,
            }
            if (!isEmpty(get(res, 'data.client_company', []))) {
              updatedLoginData.client_company = get(res, 'data.client_company', [])
            }
            if (!isEmpty(get(res, 'data.usersites', []))) {
              updatedLoginData.usersites = get(res, 'data.usersites', [])
            }
            localStorage.setItem('loginData', JSON.stringify(updatedLoginData))

            let totalSite = []
            const clientSite = getTotalSiteSelected()
            if (!isEmpty(selectedSiteMenu) && !isEmpty(clientSite)) {
              selectedSiteMenu.forEach(siteId => {
                clientSite.forEach(siteData => {
                  if (siteId === siteData.site_id) {
                    totalSite = [...totalSite, siteId]
                  }
                })
              })
            }
            localStorage.setItem('siteListForWO', JSON.stringify(totalSite))
            setSelectedSiteMenu(totalSite)
          }
          localStorage.setItem('headerDataUpdate', Date.now())
          // Toast.success('Facilities list updated successfully!')
          return updatedLoginSiteData
        })
      } else {
        console.log(get(res, 'message', ''))
      }
    } catch (error) {
      console.log('error - ', error)
    }
  }

  const getSelectedSite = () => {
    let totalSite = []
    const clientSite = getTotalSiteSelected()
    if (!isEmpty(selectedSiteMenu) && !isEmpty(clientSite)) {
      selectedSiteMenu.forEach(siteId => {
        clientSite.forEach(siteData => {
          if (siteId === siteData.site_id) {
            totalSite = [...totalSite, siteData]
          }
        })
      })
    }
    return totalSite
  }

  const handleSiteSelectedClick = data => {
    localStorage.setItem('siteListForWO', JSON.stringify(data))
  }

  const getSiteData = siteId => {
    const { usersites, client_company } = logindata
    const currentActiveSite = usersites.find(e => e.site_id === siteId)
    if (currentActiveSite) {
      const clientCompanyName = client_company.filter(d => d?.client_company_id.includes(currentActiveSite?.client_company_id))
      return { siteName: currentActiveSite?.site_name, clientCompanyName: clientCompanyName[0]?.client_company_name }
    } else {
      return { siteName: '', clientCompanyName: 'Select Facilities' }
    }
  }

  const handleSiteDropDownOpen = data => {
    setIsSiteDropDownOpen(prevState => {
      if (prevState) {
        const currentPath = window.location.pathname.split('/').length === 3 ? window.location.pathname : '/' + window.location.pathname.split('/')[1]
        history.push(process.env.PUBLIC_URL + currentPath)
      } else {
        getUserFacilitiesData()
      }
      return data
    })
  }

  // end menu code
  const topAppBar = (
    <AppBar position='fixed' className={classes.appBar}>
      <div className='d-flex align-items-center' style={{ height: '64px' }}>
        <div style={{ width: '250px' }}>
          <div className={`nav-logo ${classes.navBg}`} style={{ cursor: 'pointer' }} onClick={() => history.push('/')}>
            <img alt='eG logo' src={nameLogo.headerLogo} />
            <div className='nav-logo-title'>{nameLogo.name}</div>
          </div>
        </div>
        <div className='d-flex align-items-center justify-content-between' style={{ width: 'calc(100% - 250px)', padding: '0 24px' }}>
          <div className={classes.title}>{props.pageTitle}</div>
          <div className='ss-header-navbar'>
            {/* <div class="beamerTrigger">What's new</div> */}
            {checkUserRole.isSuperAdmin() && (
              <Grid className='ss-nav-drpdown'>
                {/* COMPANY AND SITE HANDLER */}
                {hasCompanyAndSiteData && (
                  <Grid item className='ss-comman-drpdown ss-nav-comman-padding mr-2' style={{ paddingRight: 0 }}>
                    <RadioDropdown
                      selected={`${selectedCompany} -> ${selectedSite}`}
                      onChange={handleSiteRadioClickForSuper}
                      valueKey='label'
                      list={accessibleSites}
                      header='Accessible Facilities'
                      title={selectedCompany}
                      subTitle={selectedSite}
                      searchPlaceholder='Search Facilities'
                      hasDefaultButton={false}
                      isFromSuperAdmin={true}
                      isFormDetails={window.location.pathname.split('/').length === 2}
                    />
                  </Grid>
                )}
                <IconButton color='inherit' onClick={viewUserProfile}>
                  <AccountCircleOutlined fontSize='small' />
                </IconButton>
                <IconButton color='inherit' onClick={logOut}>
                  <PowerSettingNewOutlined fontSize='small' />
                </IconButton>
              </Grid>
            )}

            {(accessibleRoles.includes('Manager') || accessibleRoles.includes('Client') || accessibleRoles.includes('Company Admin') || accessibleRoles.includes('Executive')) && (
              <Grid className='ss-nav-drpdown'>
                {/* ROLE HANDLER */}
                <Grid item className='ss-comman-drpdown ss-nav-comman-padding'>
                  <div className='rd-title-container d-flex align-items-center' style={{ padding: '6px 18px' }}>
                    <PersonOutlined />
                    <div className='d-flex flex-column align-items-end mr-2 ml-2'>
                      <div className='rd-text' style={{ fontSize: '12px', display: 'none' }}>
                        Role
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>{handleNewRole(selectedRole)}</span>
                    </div>
                    <ArrowDropDownIcon aria-controls='simple-menu-role' aria-haspopup='true' onClick={handleClick} style={{ cursor: 'pointer' }} />
                  </div>
                  <Menu classes={{ paper: classes.menuPaper, list: classes.menuList }} id='simple-menu-role' anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose} style={{ padding: 0 }}>
                    <div className={`${classes.drpmenuFont} p-2`} style={{ background: '#eee' }}>
                      Accessible Roles
                    </div>
                    {get(logindata, 'userroles', [])
                      .filter(user => user.role_name !== 'Technician')
                      .map((value, key) => (
                        <MenuItem className={`${classes.drpmenuItemFont} d-flex align-items-center justify-content-between`} key={key} disableTouchRipple={true}>
                          <div className='d-flex align-items-center'>
                            <Radio checked={selectedRole === value.role_name} onChange={e => handleRadioClick(value.role_name)} value={value.role_name} name='radio-button-demo' inputProps={{ 'aria-label': 'A' }} color={'primary'} size='small' />
                            <span className=' mr-2' style={{ color: '#646464', fontSize: '14px', fontWeight: 800 }}>
                              {handleNewRole(value.role_name)}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDefaultRadionClick(value.role_name)}
                            className='dont-send-button rounded px-2 py-1'
                            style={{ color: selectedDefaultRole === value.role_name ? '#fff' : '#a3a3a3', background: selectedDefaultRole === value.role_name ? theme.palette.primary.main : '#eee', fontSize: '9px' }}
                            disabled={selectedDefaultRole === value.role_name}
                          >
                            {selectedDefaultRole === value.role_name ? 'Default' : 'Set as Default'}
                          </button>
                        </MenuItem>
                      ))}
                  </Menu>
                </Grid>
                {/* CLIENT COMPANY HANDLER */}
                {/* FACILITIES HANDLER */}
                {hasCompanyAndSiteData && (
                  <Grid item className='ss-comman-drpdown ss-nav-comman-padding mr-2' style={{ paddingRight: 0 }}>
                    <RadioDropdown
                      selected={`${get(loginSiteData, 'clientCompanyName', '')} -> ${get(loginSiteData, 'siteName', '')}`}
                      onChange={handleSiteRadioClick}
                      valueKey='label'
                      list={getSiteOpts()}
                      header='Accessible Facilities'
                      title={get(loginSiteData, 'clientCompanyName', '')}
                      subTitle={get(loginSiteData, 'siteName', '')}
                      searchPlaceholder='Search Facilities'
                      hasDefaultButton={false}
                      getUserFacilitiesData={getUserFacilitiesData}
                      loading={loading}
                      isFormDetails={window.location.pathname.split('/').length === 2}
                    />
                  </Grid>
                )}
                {hasFacilityFilter && (
                  <Grid item className='ss-comman-drpdown ss-nav-comman-padding mr-2' style={{ paddingRight: 0 }}>
                    <CustomCompanyAndSiteTooltip list={getSelectedSite()} isTooltipRequireToShow={!isSiteDropDownOpen && selectedSiteMenu.length > 1 && selectedSiteMenu.length < getTotalSiteSelected().length}>
                      <CheckboxDropdown
                        title={isEmpty(selectedSiteMenu) ? 'Select Facilities' : `${selectedSiteMenu.length === getTotalSiteSelected().length ? 'All' : selectedSiteMenu.length === 1 ? getSiteData(selectedSiteMenu[0])?.clientCompanyName : 'Custom'}`}
                        subTitle={selectedSiteMenu.length === 1 ? getSiteData(selectedSiteMenu[0]).siteName : ''}
                        menuOptions={getTotalSiteSelected()}
                        selectedMenu={selectedSiteMenu}
                        onFilterBtnClick={handleSiteSelectedClick}
                        keyId='site_id'
                        IsDropDownOpen={isSiteDropDownOpen}
                        setIsDropDownOpen={handleSiteDropDownOpen}
                        loading={loading}
                      />
                    </CustomCompanyAndSiteTooltip>
                  </Grid>
                )}
                {selectedRole === 'Manager' && (
                  <Grid style={{ paddingRight: '10px' }}>
                    <NotificationCount count={notificationsCount} onClick={() => setNotificationOpen(true)} isNotificationOpen={isNotificationOpen} />
                  </Grid>
                )}
                <QuickAssist />
                <UserMenu selectedRole={selectedRole} />
              </Grid>
            )}
          </div>
        </div>
      </div>
    </AppBar>
  )

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <CssBaseline />
        {topAppBar}
        <nav className={classes.drawer + ' nav-sidebar'} style={{ position: 'fixed', width: `${drawerWidth}px` }}>
          <MainDrawer setDrawerWidth={setDrawerWidth} />
        </nav>
        <main style={{ marginLeft: `${drawerWidth}px`, width: `calc(100% - ${drawerWidth}px)` }}>
          <Toolbar />
          <Container style={{ margin: 0, padding: 0 }}>
            <Body />
          </Container>
        </main>
        {isNotificationOpen && <Notification open={isNotificationOpen} onClose={() => setNotificationOpen(false)} />}
      </div>
    </ErrorBoundary>
  )
}
