import React from 'react'
import { withRouter, Route, Redirect, Switch, useParams } from 'react-router-dom'
import { WithTitle } from '../AppMenuComponent'
import Dashboard from '../Dashboard/DashboardComponent'
import Assets from '../Assets/AssetsComponent'
import Inspections from '../Inspection/InspectionsComponent'
import AssetWiseInspectionPhotos from '../Inspection/AssetWiseInspectionPhotos'
import WorkOrders from '../Issues/WorkOrdersComponent'
import Profile from 'components/User/profile'
import Reports from '../Report/ReportsComponent'
import Users from '../User/UsersComponent'
import Login from '../Login/LoginComponent'
import Generallogin from '../GeneralLoginComponent'
import ForgotPassword from '../ForgotPasswordComponent'
import SetNewPasswordComponent from '../SetNewPasswordComponent'
import SetPasswordComponent from '../SetPasswordComponent'
import DevicesComponent from '../Devices/DevicesComponent1'
import { connect } from 'react-redux'
import $ from 'jquery'
import '../../Content/css/style.css'
import '../../Content/css/bootstrap.min.css'
import firebase from 'firebase'
import { messaging } from '../init-fcm'
import enums from '../../Constants/enums'
import { history } from '../../helpers/history'
import getUserRole from '../../helpers/getUserRole'
import DashboardQuicksights from '../Dashboard/DashboardQuicksights'
import NotificationSettings from '../Notification/NotificationSettings'
import MaintainanceRequests from '../Requests/MaintainanceRequests'
import WorkOrderComponent from '../WorkOrders/WorkOrderComponent'
import Tasklist from '../Tasks/Tasklist'
import InspectionFormComponent from '../Forms/InspectionFormComponent.jsx'
import Submitted from '../Submitted/Submitted.jsx'
import Hierarchy from '../Assets/Hierarchy.jsx'
import Cluster from '../Assets/Cluster.jsx'
import PDFViewer from 'components/Pdf/PDFViewer'
import RenderRdfForm from 'components/Pdf/render-pdf-form'
import QRCodeList from 'components/Pdf/qr-logo'
import AssetClass from 'components/Assets/asset-class'
import PreventativeMaintenance from 'components/preventative-maintenance'
import OneLine from 'components/one-line'
import Equipments from 'components/equipments'
import LocationsTabs from 'components/locations/locations-tabs'
import MasterPM from 'components/preventative-maintenance/master'
import Facilities from 'components/facilities'
import OnBoarding from 'components/reviews/on-boarding'
import MaintenanceList from 'components/reviews/maintenance-list'
import InfraredThermography from 'components/reviews/infrared-thermography'
import BusinessOverview from 'components/Dashboard/business-overview'
import DashboardMaintenance from 'components/Dashboard/dashboard-maintenance'
import AssetOverview from 'components/Dashboard/asset-overview'
import NFPA70BCompliance from 'components/Dashboard/nfpa-70b-compliance'
import NFPA70ECompliance from 'components/Dashboard/nfpa-70e-compliance'
import Quotes from 'components/quotes/quoteComponent'
import Report from 'components/reviews/reports'
import ReviewsTabs from 'components/reviews/reviews-tabs'
import AIBuilder from 'components/AIBuilder/AIBuilder'
import Estimator from 'components/Estimator'
import Settings from 'components/settings'
import Documents from 'components/documents'
import Authentication from 'components/Authentication'
import Vendor from 'components/JobScheduler/Vendor'
import MaintenanceCommand from 'components/Estimator/MaintenanceCommand'
import Health from 'components/Health'

var self
const checkAuth = () => {
  var auth = localStorage.getItem('authenticated')
  var loginData = localStorage.getItem('loginData')
  loginData = JSON.parse(loginData)
  if (auth == 'true') {
    if (localStorage.getItem('roleName') === enums.userRoles[0].role || localStorage.getItem('roleName') === enums.userRoles[1].role || localStorage.getItem('roleName') === enums.userRoles[4].role || localStorage.getItem('roleName') === enums.userRoles[5].role) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

const getInitialRoute = () => {
  const role = new getUserRole()
  if (role.isSuperAdmin()) return '/assets'
  if (role.isCompanyAdmin()) return '/assets'
  if (role.isManager()) return '/dashboard'
  if (role.isExecutive()) return '/quickinsights'
}

const AuthRoute = ({ component: Component, ...rest }) => <Route {...rest} render={props => (checkAuth() ? <Component {...props} /> : <Redirect to={{ pathname: '/login' }} />)} />
const UnAuthRoute = ({ component: Component, ...rest }) => <Route {...rest} render={props => (checkAuth() ? <Redirect to={{ pathname: getInitialRoute() }} /> : <Component {...props} />)} />
const NoMatchRoute = ({ component: Component, ...rest }) => <Route {...rest} render={props => (checkAuth() ? <Redirect to={{ pathname: '/dashboard' }} /> : <Redirect to={{ pathname: '/' }} />)} />
class Main extends React.Component {
  constructor(props) {
    super(props)
    self = this
    var logindata = localStorage.getItem('loginData')
    this.state = {
      isAuthenticated: false,
      userRole: '',
      loginData: JSON.parse(logindata),
    }
  }
  async componentDidMount() {
    $('#pageLoading').hide()
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('firebase-messaging-sw.js')
        .then(() => {})
        .catch(() => {})
    }

    if (localStorage.getItem('fcmToken')) {
    } else {
      messaging
        .requestPermission()
        .then(async function () {
          const token = await messaging.getToken()
          //console.log(token)
          localStorage.setItem('fcmToken', token)
        })
        .catch(function (err) {
          //console.log('Unable to get permission to notify.', err)
        })
    }

    navigator.serviceWorker.addEventListener('message', message => {
      //console.log('Main object - ', message)
      //console.log('Main object - ', message.data)
      //console.log('Main object - ', message.data.firebaseMessaging)

      if (message.data['firebaseMessaging']) {
        var notificationObj = message.data['firebaseMessaging']
        //console.log(notificationObj.payload.data)
      }

      // if(message.data['firebase-messaging-msg-data']){

      //     var notificationObj = message.data['firebase-messaging-msg-data']
      //     //console.log(notificationObj.data)

      // }
      var redirectURl = ''
      //console.log('notificationObj.payload.data.type = ', notificationObj.payload.data.type)
      if (notificationObj.payload.data.type == enums.notificationType[0].id) {
        //1 auto approve inspection
        redirectURl = '/inspections/details/' + notificationObj.payload.data.ref_id
      } else if (notificationObj.payload.data.type == enums.notificationType[1].id) {
        //2 PendingNewInspection
        redirectURl = '/inspections'
      } else if (notificationObj.payload.data.type == enums.notificationType[2].id) {
        //6 UpdateWorkOrderStatus
        redirectURl = '/workorders/details/' + notificationObj.payload.data.ref_id
      }

      if (notificationObj.type != 'notification-clicked') {
        //console.log('notificationObj.type != notification-clicked')
        var notification = new Notification(notificationObj.payload.data.title, {
          icon: 'http://localhost:3005/proassets/images/project-jarvis.png',
          body: notificationObj.payload.data.body,
        })

        notification.onclick = function (event) {
          //console.log('onclick ')
          event.preventDefault() // prevent the browser from focusing the Notification's tab
          history.push(redirectURl)
        }
      } else if (notificationObj.type == 'notification-clicked') {
        //console.log('notificationObj.type == notification-clicked')
        //console.log('redirectURl', redirectURl)
        history.push(redirectURl)
      }
      // history.push(redirectURl);
    })

    navigator.serviceWorker.addEventListener('notificationclick', function (e) {
      //console.log('notificationclick - ')

      var notification = e.notification

      var action = e.action

      if (action === 'close') {
        notification.close()
      } else {
        notification.close()
      }
    })

    //console.log('in app')

    messaging.onMessage(function (payload) {
      //console.log('Message received 123. ', payload)
      // var notification = new Notification("payload.notification.title", {
      //   icon:"http://localhost:3005/proassets/images/project-jarvis.png",
      //   body: "payload.notification.body"
      // });
      // notification.onclick = function(event) {
      //   event.preventDefault(); // prevent the browser from focusing the Notification's tab
      //   window.open(URL.notificationUrl, "_blank");
      // };
    })
  }
  render() {
    return (
      <Switch>
        <UnAuthRoute exact={true} path='/' component={Generallogin} />
        <UnAuthRoute path='/home' component={Login} />
        <UnAuthRoute path='/forgotpassword' component={ForgotPassword} />
        <UnAuthRoute path='/resetpassword/:code' component={SetNewPasswordComponent} />
        <UnAuthRoute path='/setpassword' component={SetPasswordComponent} />
        <UnAuthRoute path='/login' component={Generallogin} />
        <UnAuthRoute path='/authentication' component={Authentication} />
        <UnAuthRoute path='/task-forms/:woId' component={RenderRdfForm} />
        <AuthRoute path='/dashboard' component={() => <WithTitle bodyComponent={Dashboard} title='Dashboard' pageTitle='Dashboard' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/assets' component={() => <WithTitle bodyComponent={Assets} title='Assets' pageTitle='Assets' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/equipments' component={() => <WithTitle bodyComponent={Equipments} title='Test Equipment' pageTitle='Test Equipment' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/locations' component={() => <WithTitle bodyComponent={LocationsTabs} title='Locations' pageTitle='Locations' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/hierarchy' component={() => <WithTitle bodyComponent={Hierarchy} title='Hierarchy' pageTitle='Hierarchy' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/cluster' component={() => <WithTitle bodyComponent={OneLine} title='Digital One-Line' pageTitle='Digital One-Line' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/inspections' component={() => <WithTitle bodyComponent={Inspections} title='Checklists' pageTitle='Checklists' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/submitted/:id' component={() => <WithTitle bodyComponent={Submitted} title='Submitted' pageTitle='Submitted' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/inspection-forms' component={() => <WithTitle bodyComponent={InspectionFormComponent} title='Forms' pageTitle='Forms' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/inspection-photos' component={() => <WithTitle bodyComponent={AssetWiseInspectionPhotos} title='Asset wise Inspection Photos' pageTitle='Asset wise Inspection Photos' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/issues' component={() => <WithTitle bodyComponent={WorkOrders} title='Issues' pageTitle='Issues' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/reports' component={() => <WithTitle bodyComponent={Reports} title='Reports' pageTitle='Reports' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/quickinsights' component={() => (localStorage.getItem('roleName') !== enums.userRoles[1].role ? <WithTitle bodyComponent={DashboardQuicksights} title='Quick Insights' pageTitle='Quick Insights' userRole={localStorage.getItem('roleName')} /> : <Redirect to={{ pathname: '/assets' }} />)} />
        <AuthRoute path='/devices' component={() => <WithTitle bodyComponent={DevicesComponent} title='Devices' pageTitle='Devices' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/users' component={() => <WithTitle bodyComponent={Users} title='Users' pageTitle='Users' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/profile' component={() => <WithTitle bodyComponent={Profile} title='Profile' pageTitle='Profile' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/preventative-maintenance' component={() => <WithTitle bodyComponent={PreventativeMaintenance} title='Preventative Maintenance List' pageTitle='Preventative Maintenance List' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/preventative-maintenance-config' component={() => <WithTitle bodyComponent={MasterPM} title='Preventative Maintenance Config' pageTitle='Preventative Maintenance Config' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/maintenance-requests' component={() => <WithTitle bodyComponent={MaintainanceRequests} title='Maintenance Requests' pageTitle='Maintenance Requests' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/notification-settings' component={() => <WithTitle bodyComponent={NotificationSettings} title='Notification Settings' pageTitle='Notification Settings' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/workorders' component={() => <WithTitle bodyComponent={WorkOrderComponent} title='Work Orders' pageTitle='Work Orders' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/tasks' component={() => <WithTitle bodyComponent={Tasklist} title='Tasks' pageTitle='Tasks' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/engineering-letter' component={PDFViewer} />
        <AuthRoute path='/asset-classes' component={() => <WithTitle bodyComponent={AssetClass} title='Asset Class' pageTitle='Asset Class' />} />
        <AuthRoute path='/qr-list' component={() => <WithTitle bodyComponent={QRCodeList} title='QR' pageTitle='QR' />} />
        <AuthRoute path='/facilities' component={() => <WithTitle bodyComponent={Facilities} title='Facilities' pageTitle='Facilities' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/business-overview' component={() => <WithTitle bodyComponent={BusinessOverview} title='Business Overview' pageTitle='Business Overview' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/dashboard-maintenance' component={() => <WithTitle bodyComponent={DashboardMaintenance} title='Maintenance' pageTitle='Maintenance' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/asset-overview' component={() => <WithTitle bodyComponent={AssetOverview} title='Assets Overview' pageTitle='Assets Overview' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/nfpa-70b-compliance' component={() => <WithTitle bodyComponent={NFPA70BCompliance} title='NFPA 70B Compliance' pageTitle='NFPA 70B Compliance' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/nfpa-70e-compliance' component={() => <WithTitle bodyComponent={NFPA70ECompliance} title='NFPA 70E Compliance' pageTitle='NFPA 70E Compliance' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/quote' component={() => <WithTitle bodyComponent={Quotes} title='Quotes' pageTitle='Quotes' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/ai-builder' component={() => <WithTitle bodyComponent={AIBuilder} title='Egalvanic AI' pageTitle='Egalvanic AI' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/estimator' component={() => <WithTitle bodyComponent={Estimator} title='Estimator' pageTitle='Estimator' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/maintenance-command-center' component={() => <WithTitle bodyComponent={MaintenanceCommand} title='Maintenance Command Center' pageTitle='Maintenance Command Center' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/reviews/reports' component={() => <WithTitle bodyComponent={Report} title='Reports' pageTitle='Reports' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/reviews' component={() => <WithTitle bodyComponent={ReviewsTabs} title='Pending Reviews' pageTitle='Pending Reviews' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/settings' component={() => <WithTitle bodyComponent={Settings} title='Settings' pageTitle='Settings' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/documents' component={() => <WithTitle bodyComponent={Documents} title='Documents' pageTitle='Documents' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/vendors' component={() => <WithTitle bodyComponent={Vendor} title='Vendors' pageTitle='Vendors' userRole={localStorage.getItem('roleName')} />} />
        <AuthRoute path='/health' component={() => <WithTitle bodyComponent={Health} title='Health' pageTitle='Health' userRole={localStorage.getItem('roleName')} />} />
        <NoMatchRoute />
      </Switch>
    )
  }
}
function mapState(state) {
  //console.log('main component state ----------', state)
  // const isAuthenticated = false;
  // if (state.loginReducer) {
  //     const isAuthenticated = state.loginReducer.isAuthenticated;
  //     if (self) {
  //         self.setState({ isAuthenticated: state.loginReducer.isAuthenticated })
  //     }
  //     return { isAuthenticated };
  // }
  // return { isAuthenticated };
  return {}
}
export default connect(mapState)(withRouter(Main))
