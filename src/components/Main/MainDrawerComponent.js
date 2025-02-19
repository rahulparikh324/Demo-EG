import React from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import MenuItem from '@material-ui/core/MenuItem'
import AppsOutlined from '@material-ui/icons/AppsOutlined'

import AssignmentTurnedInOutlined from '@material-ui/icons/AssignmentTurnedInOutlined'
import ImportantDevicesIcon from '@material-ui/icons/ImportantDevices'
import AssessmentOutlined from '@material-ui/icons/AssessmentOutlined'
import DashboardOutlined from '@material-ui/icons/DashboardOutlined'
import TrendingUpOutlinedIcon from '@material-ui/icons/TrendingUpOutlined'
import ClassOutlinedIcon from '@material-ui/icons/ClassOutlined'
import ReportProblemOutlinedIcon from '@material-ui/icons/ReportProblemOutlined'
import PersonOutlineIcon from '@material-ui/icons/PersonOutline'
import GroupOutlined from '@material-ui/icons/GroupOutlined'
import BuildOutlinedIcon from '@material-ui/icons/BuildOutlined'
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight'
import { NavLink, withRouter } from 'react-router-dom'
import VerticalSplitOutlinedIcon from '@material-ui/icons/VerticalSplitOutlined'
import PhotoOutlinedIcon from '@material-ui/icons/PhotoOutlined'
import ListIcon from '@material-ui/icons/List'
import GrainOutlinedIcon from '@material-ui/icons/GrainOutlined'
import AccountTreeOutlinedIcon from '@material-ui/icons/AccountTreeOutlined'
import BeenhereOutlinedIcon from '@material-ui/icons/BeenhereOutlined'
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone'
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck'
import ListAltOutlinedIcon from '@material-ui/icons/ListAltOutlined'
import RecentActorsOutlinedIcon from '@material-ui/icons/RecentActorsOutlined'
import getUserRole from '../../helpers/getUserRole'
import getLogoName from '../../helpers/getLogoName'
import './drawer.css'
import { history } from '../../helpers/history'
import { withStyles } from '@material-ui/styles'
import LowPriorityIcon from '@material-ui/icons/LowPriority'
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined'
import BusinessOutlinedIcon from '@material-ui/icons/BusinessOutlined'
import EventAvailableOutlinedIcon from '@material-ui/icons/EventAvailableOutlined'
import ComputerOutlinedIcon from '@material-ui/icons/ComputerOutlined'
import SettingsApplicationsOutlinedIcon from '@material-ui/icons/SettingsApplicationsOutlined'
import ContactlessOutlinedIcon from '@material-ui/icons/ContactlessOutlined'
import BusinessCenterOutlinedIcon from '@material-ui/icons/BusinessCenterOutlined'
import AssessmentOutlinedIcon from '@material-ui/icons/AssessmentOutlined'
import DonutSmallOutlinedIcon from '@material-ui/icons/DonutSmallOutlined'
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined'
import RateReviewOutlinedIcon from '@material-ui/icons/RateReviewOutlined'
import AssignmentOutlinedIcon from '@material-ui/icons/AssignmentOutlined'
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm'
import EventSeatOutlinedIcon from '@material-ui/icons/EventSeatOutlined'
import FolderOpenOutlinedIcon from '@material-ui/icons/FolderOpenOutlined'
import FavoriteBorderOutlinedIcon from '@material-ui/icons/FavoriteBorderOutlined'

import { Toast } from 'Snackbar/useToast'
import { get } from 'lodash'
import reviews from 'Services/reviews'
import { MainContext } from 'components/Main/provider'
import { EngineeringOutlined } from 'components/common/others'

const styles = theme => ({
  navBg: { background: theme.palette.primary.main },
})

const TitleCount = ({ title, count }) => {
  return (
    <div className='d-flex justify-content-between' style={{ width: '182px' }}>
      <span>{title}</span>
      <span className='d-flex align-items-center justify-content-center'>{count !== 0 ? count : ''}</span>
    </div>
  )
}

class NavTab extends React.Component {
  render() {
    if (!this.props.show) return <></>
    return (
      <MenuItem style={this.props.isCollapsed ? null : this.props.style} className={this.props.displace ? 'nav-tab nav-tab-displace' : 'nav-tab'} component={NavLink} to={this.props.to} selected={this.props.selected}>
        {this.props.icon}
        {!this.props.isCollapsed && <span>{this.props.name}</span>}
      </MenuItem>
    )
  }
}

class NavGroup extends React.Component {
  render() {
    if (!this.props.show) return <></>
    if (this.props.isCollapsed) return <div className='nav-group-title'>{'----'}</div>
    return <div className='nav-group-title'>{this.props.name}</div>
  }
}

// class NavSubGroup extends React.Component {
//   render() {
//     if (!this.props.show || this.props.isCollapsed) return <></>
//     return (
//       <div className='nav-group-title' style={{ paddingLeft: '56px' }}>
//         {this.props.name}
//       </div>
//     )
//   }
// }

class MainDrawer extends React.Component {
  constructor(props) {
    super(props)
    this.checkUserRole = new getUserRole()
    this.nameLogo = getLogoName()
    this.companyID = JSON.parse(localStorage.getItem('loginData')).active_company_id
    this.state = {
      selected: {
        dashboard: this.props.location.pathname === '/dashboard',
        assets: this.props.location.pathname === '/assets' || this.props.location.pathname.split('/')[1] === 'assets',
        equipments: this.props.location.pathname === '/equipments' || this.props.location.pathname.split('/')[1] === 'equipments',
        inspections: this.props.location.pathname === '/inspections' || this.props.location.pathname.split('/')[1] === 'inspections',
        issues: this.props.location.pathname === '/issues' || this.props.location.pathname.split('/')[1] === 'issues',
        reports: this.props.location.pathname === '/reports',
        users: this.props.location.pathname === '/users' || this.props.location.pathname.split('/')[1] === 'users',
        vendors: this.props.location.pathname === '/vendors' || this.props.location.pathname.split('/')[1] === 'vendors',
        quickinsights: this.props.location.pathname === '/quickinsights',
        photos: this.props.location.pathname === '/inspection-photos',
        devices: this.props.location.pathname === '/devices',
        pmList: this.props.location.pathname === '/preventative-maintenance-list',
        pmSetting: this.props.location.pathname === '/preventative-maintenance',
        pmConfig: this.props.location.pathname === '/preventative-maintenance-config',
        notfSetting: this.props.location.pathname === '/notification-settings',
        pmRequests: this.props.location.pathname === '/maintenance-requests',
        workorders: this.props.location.pathname === '/workorders' || this.props.location.pathname.split('/')[1] === 'workorders',
        tasks: this.props.location.pathname === '/tasks',
        reviews: this.props.location.pathname === '/reviews',
        inspectionFprms: this.props.location.pathname === '/inspection-forms' || this.props.location.pathname.split('/')[1] === 'inspection-forms',
        hierarchy: this.props.location.pathname === '/hierarchy' || this.props.location.pathname.split('/')[1] === 'hierarchy',
        locations: this.props.location.pathname === '/locations' || this.props.location.pathname.split('/')[1] === 'locations',
        cluster: this.props.location.pathname === '/cluster' || this.props.location.pathname.split('/')[1] === 'cluster',
        classes: this.props.location.pathname === '/asset-classes' || this.props.location.pathname.split('/')[1] === 'asset-classes',
        facilities: this.props.location.pathname === '/facilities' || this.props.location.pathname.split('/')[1] === 'facilities',
        settings: this.props.location.pathname === '/settings',
        businessOverview: this.props.location.pathname === '/business-overview',
        dashboardMaintenance: this.props.location.pathname === '/dashboard-maintenance',
        assetOverview: this.props.location.pathname === '/asset-overview',
        nfpa70BCompliance: this.props.location.pathname === '/nfpa-70b-compliance',
        nfpa70ECompliance: this.props.location.pathname === '/nfpa-70e-compliance',
        quote: this.props.location.pathname === '/quote' || this.props.location.pathname.split('/')[1] === 'quote',
        ai_builder: this.props.location.pathname === '/ai-builder' || this.props.location.pathname.split('/')[1] === 'ai-builder',
        estimator: this.props.location.pathname === '/estimator' || this.props.location.pathname.split('/')[1] === 'estimator',
        maintenanceCommand: this.props.location.pathname === '/maintenance-command-center' || this.props.location.pathname.split('/')[1] === 'maintenance-command-center',
        documents: this.props.location.pathname === '/documents',
        health: this.props.location.pathname === '/health',
      },
      isEgalvanicAiRequired: JSON.parse(localStorage.getItem('loginData'))?.is_egalvanic_ai_required,
      isEstimatorRequired: JSON.parse(localStorage.getItem('loginData')).is_estimator_feature_required,
      isRequiredMaintenanceCommandCenter: JSON.parse(localStorage.getItem('loginData')).is_required_maintenance_command_center,
      tostMsg: {},
      pmOpen: false,
      showToggle: false,
      isSmall: false,
    }
  }

  reviewsCount = async () => {
    try {
      const res = await reviews.submittedAssetsCount()
      if (res.success > 0) this.context.setCounter(res.data)
    } catch (error) {
      console.log(error)
    }
  }

  componentDidMount() {
    if (this.state.selected.pmList || this.state.selected.pmSetting) this.setState({ pmOpen: true })
    if (window.location.pathname === '/dashboard') {
      this.reviewsCount()
    }
    this.setState({ isSmall: Number(localStorage.getItem('drawerWidth')) === 75 })
  }
  toggleSideBar = () => {
    const width = localStorage.getItem('drawerWidth')
    if (!width) localStorage.setItem('drawerWidth', 75)
    else if (Number(width) === 75) localStorage.setItem('drawerWidth', 250)
    else localStorage.setItem('drawerWidth', 75)
    this.props.setDrawerWidth(this.state.isSmall ? 250 : 75)
    this.setState({ isSmall: !this.state.isSmall })
  }

  render() {
    return (
      <div>
        <CssBaseline />
        <div style={{ height: '64px' }}></div>
        <div onMouseOver={() => this.setState({ showToggle: true })} onMouseOut={() => this.setState({ showToggle: false })} className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 82px)', height: 'calc(100vh - 82px)' }}>
          <div className='menu'>
            <div className='menu-toggle' onClick={this.toggleSideBar} style={{ display: this.state.showToggle ? 'flex' : 'none', left: this.state.isSmall ? '55px' : '230px' }}>
              {this.state.isSmall ? <KeyboardArrowRightIcon fontSize='small' /> : <KeyboardArrowLeftIcon fontSize='small' />}
            </div>
            {/* DASHBOARD */}
            <NavGroup show={!this.checkUserRole.isSuperAdmin()} isCollapsed={this.state.isSmall} name='Dashboards' />
            <NavTab show={this.checkUserRole.isManager() || this.checkUserRole.isExecutive()} isCollapsed={this.state.isSmall} name='Overview' to='/dashboard' icon={<DashboardOutlined fontSize='small' />} selected={this.state.selected.dashboard} />
            <NavTab show={this.checkUserRole.isCompanyAdmin()} isCollapsed={this.state.isSmall} name='Business Overview' to='/business-overview' icon={<BusinessCenterOutlinedIcon fontSize='small' />} selected={this.state.selected.businessOverview} />
            <NavTab show={this.checkUserRole.isCompanyAdmin() || this.checkUserRole.isManager()} isCollapsed={this.state.isSmall} name='Maintenance' to='/dashboard-maintenance' icon={<SettingsApplicationsOutlinedIcon fontSize='small' />} selected={this.state.selected.dashboardMaintenance} />
            <NavTab show={this.checkUserRole.isCompanyAdmin() || this.checkUserRole.isExecutive()} isCollapsed={this.state.isSmall} name='Assets Overview' to='/asset-overview' icon={<AssessmentOutlinedIcon fontSize='small' />} selected={this.state.selected.assetOverview} />
            <NavTab show={this.checkUserRole.isCompanyAdmin() || this.checkUserRole.isManager() || this.checkUserRole.isExecutive()} isCollapsed={this.state.isSmall} name='NFPA 70B Compliance' to='/nfpa-70b-compliance' icon={<DonutSmallOutlinedIcon fontSize='small' />} selected={this.state.selected.nfpa70BCompliance} />
            <NavTab show={this.checkUserRole.isCompanyAdmin() || this.checkUserRole.isManager() || this.checkUserRole.isExecutive()} isCollapsed={this.state.isSmall} name='NFPA 70E Compliance' to='/nfpa-70e-compliance' icon={<DonutSmallOutlinedIcon fontSize='small' />} selected={this.state.selected.nfpa70ECompliance} />
            {/* ASSETS */}
            <NavGroup show isCollapsed={this.state.isSmall} name='Assets' />
            <NavTab show isCollapsed={this.state.isSmall} name='List' to='/assets' icon={<AppsOutlined fontSize='small' />} selected={this.state.selected.assets} />
            <NavTab show={!this.checkUserRole.isSuperAdmin()} isCollapsed={this.state.isSmall} name='Locations' to='/locations' icon={<AccountTreeOutlinedIcon fontSize='small' />} selected={this.state.selected.locations} />
            <NavTab show={!this.checkUserRole.isSuperAdmin()} isCollapsed={this.state.isSmall} name='Digital One-Line' to='/cluster' icon={<GrainOutlinedIcon fontSize='small' />} selected={this.state.selected.cluster} />
            <NavTab show={!this.checkUserRole.isSuperAdmin() && !this.checkUserRole.isExecutive()} isCollapsed={this.state.isSmall} name='Health' to='/health' icon={<FavoriteBorderOutlinedIcon fontSize='small' />} selected={this.state.selected.health} />
            {/* MAINTENANCE */}
            <NavGroup show={this.checkUserRole.isCompanyAdmin() || this.checkUserRole.isManager() || this.checkUserRole.isExecutive()} isCollapsed={this.state.isSmall} name='Maintenance' />
            <NavTab show={this.checkUserRole.isManager() || this.checkUserRole.isCompanyAdmin() || this.checkUserRole.isExecutive()} isCollapsed={this.state.isSmall} name='Work Orders' to='/workorders' icon={<DescriptionOutlinedIcon fontSize='small' />} selected={this.state.selected.workorders} />
            <NavTab show={this.checkUserRole.isManager() || this.checkUserRole.isCompanyAdmin()} isCollapsed={this.state.isSmall} name='Pending Reviews' to='/reviews' icon={<RateReviewOutlinedIcon fontSize='small' />} selected={this.state.selected.reviews} />
            <NavTab show={this.checkUserRole.isCompanyAdmin() || this.checkUserRole.isManager()} isCollapsed={this.state.isSmall} name='PM List' to='/preventative-maintenance' icon={<RecentActorsOutlinedIcon fontSize='small' />} selected={this.state.selected.pmSetting} />

            <NavTab show={this.checkUserRole.isManager() || this.checkUserRole.isExecutive() || this.checkUserRole.isCompanyAdmin()} isCollapsed={this.state.isSmall} name='Issues' to='/issues' icon={<ReportProblemOutlinedIcon fontSize='small' />} selected={this.state.selected.issues} />
            {/* WORKORDERS */}
            {/* Quotes */}
            <NavGroup show={this.checkUserRole.isManager() || this.checkUserRole.isCompanyAdmin()} isCollapsed={this.state.isSmall} name='Opportunities' />
            <NavTab show={this.checkUserRole.isManager() || this.checkUserRole.isCompanyAdmin()} isCollapsed={this.state.isSmall} name='Quotes' to='/quote' icon={<AssignmentOutlinedIcon fontSize='small' />} selected={this.state.selected.quote} />
            {/* AI Builder */}
            <NavGroup show={(this.checkUserRole.isManager() || this.checkUserRole.isCompanyAdmin()) && (this.context.featureFlag.isEstimator || this.context.featureFlag.isEgalvanicAI || this.context.featureFlag.isRequiredMaintenanceCommandCenter)} isCollapsed={this.state.isSmall} name='Beta' />
            <NavTab show={(this.checkUserRole.isManager() || this.checkUserRole.isCompanyAdmin()) && this.context.featureFlag.isEgalvanicAI} isCollapsed={this.state.isSmall} name='Egalvanic AI' to='/ai-builder' icon={<EventSeatOutlinedIcon fontSize='small' />} selected={this.state.selected.ai_builder} />
            <NavTab show={(this.checkUserRole.isManager() || this.checkUserRole.isCompanyAdmin()) && this.context.featureFlag.isEstimator} isCollapsed={this.state.isSmall} name='Estimator' to='/estimator' icon={<AccessAlarmIcon fontSize='small' />} selected={this.state.selected.estimator} />
            <NavTab show={(this.checkUserRole.isManager() || this.checkUserRole.isCompanyAdmin()) && this.context.featureFlag.isRequiredMaintenanceCommandCenter} isCollapsed={this.state.isSmall} name='Maintenance Command Center' to='/maintenance-command-center' icon={<EngineeringOutlined />} selected={this.state.selected.maintenanceCommand} />
            {/* MANAGE */}
            <NavGroup show={!this.checkUserRole.isExecutive()} isCollapsed={this.state.isSmall} name='Manage' />
            <NavTab show={this.checkUserRole.isCompanyAdmin()} isCollapsed={this.state.isSmall} name='Classes' to='/asset-classes' icon={<ClassOutlinedIcon fontSize='small' />} selected={this.state.selected.classes} />
            <NavTab show={this.checkUserRole.isCompanyAdmin()} isCollapsed={this.state.isSmall} name={this.state.isSmall ? '' : 'Forms'} to='/inspection-forms' icon={<VerticalSplitOutlinedIcon fontSize='small' />} selected={this.state.selected.inspectionFprms} />
            <NavTab show={!this.checkUserRole.isExecutive() && !this.checkUserRole.isSuperAdmin()} isCollapsed={this.state.isSmall} name={this.state.isSmall ? '' : 'Documents'} to='/documents' icon={<FolderOpenOutlinedIcon fontSize='small' />} selected={this.state.selected.documents} />
            <NavTab show={this.checkUserRole.isCompanyAdmin() || this.checkUserRole.isSuperAdmin()} isCollapsed={this.state.isSmall} name='PM Config' to='/preventative-maintenance-config' icon={<BuildOutlinedIcon fontSize='small' />} selected={this.state.selected.pmConfig} />
            <NavTab
              isCollapsed={this.state.isSmall}
              show={this.checkUserRole.isCompanyAdmin()}
              name='Test Equipment'
              to='/equipments'
              icon={
                <svg xmlns='http://www.w3.org/2000/svg' height='20' viewBox='0 -960 960 960' width='20'>
                  <path
                    fill='#525252'
                    d='M770.152-111.391 518.435-363.348l60.826-60.826 251.957 251.718-61.066 61.065Zm-582.674 0-60.587-61.065 290.718-290.718-108.435-108.435-23 23-41.609-41.369v82.369l-25.195 25.435L92.109-609.435l25.195-25.195h83.609l-45.609-45.848 133.152-132.674q17.479-17.478 38.196-23.718 20.718-6.239 45.435-6.239 24.717 0 45.554 8.859 20.837 8.859 38.316 26.098L347.761-700.196l48 47.761-24 24 105.435 105.674 123.195-123.196q-7.761-12.521-12.261-29.641-4.5-17.119-4.5-35.88 0-53.957 39.337-93.413 39.337-39.457 93.533-39.457 15.718 0 27.055 3.359 11.336 3.359 19.054 9.076l-85 85.239 73.087 73.087 85.239-85.239q5.956 8.717 9.576 21.174 3.62 12.456 3.62 28.174 0 54.195-39.337 93.532-39.337 39.337-93.294 39.337-17.761 0-30.641-2.5-12.881-2.5-23.641-7.261l-474.74 474.979Z'
                  />
                </svg>
              }
              selected={this.state.selected.equipments}
            />
            <NavTab show={!this.checkUserRole.isExecutive()} isCollapsed={this.state.isSmall} name='Users' to='/users' icon={<PersonOutlineIcon fontSize='small' />} selected={this.state.selected.users} />
            <NavTab show={this.checkUserRole.isCompanyAdmin()} isCollapsed={this.state.isSmall} name='Vendors' to='/vendors' icon={<GroupOutlined fontSize='small' />} selected={this.state.selected.vendors} />
            <NavTab show={this.checkUserRole.isCompanyAdmin() || this.checkUserRole.isSuperAdmin()} isCollapsed={this.state.isSmall} name='Facilities' to='/facilities' icon={<BusinessOutlinedIcon fontSize='small' />} selected={this.state.selected.facilities} />
            <NavTab show={this.checkUserRole.isSuperAdmin()} isCollapsed={this.state.isSmall} name='Settings' to='/settings' icon={<SettingsOutlinedIcon fontSize='small' />} selected={this.state.selected.settings} />
            <NavTab show={this.checkUserRole.isSuperAdmin() || this.checkUserRole.isCompanyAdmin()} isCollapsed={this.state.isSmall} name='Devices' to='/devices' icon={<ImportantDevicesIcon fontSize='small' />} selected={this.state.selected.devices} />
          </div>
        </div>
      </div>
    )
  }
}
MainDrawer.contextType = MainContext
export default withRouter(withStyles(styles)(MainDrawer))
