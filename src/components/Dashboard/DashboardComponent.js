import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import DashboardPendingApprovals from './DashboardPendingApprovalsComponent'
import DashboardCheckedOutAssets from './DashboardCheckedOutAssetsComponent'
import dashboardListAction from '../../Actions/Dashboard/dashboardAction'
import approveInspectionAction from '../../Actions/Inspection/approveInspectionAction'
import DashboardOutstandingIssue from './DashboardOutstandingIssueComponent'
import { connect } from 'react-redux'
import $ from 'jquery'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/styles'
import enums from '../../Constants/enums'
import PendingInspectionApprovePopup from '../Inspection/pendingInspectionApprovePopup'
import { history } from '../../helpers/history'
import _ from 'lodash'
import dashboardStateUpdate from '../../Actions/Dashboard/dashboardStateUpdate'
import ActivityFeed from './ActivityFeed'
import DashboardMetrics from './DashboardMetrics'
import { NewDashboardMertics, AssetStates } from './components'
import Drawer from '@material-ui/core/Drawer'
import { FormTitle } from '../Maintainance/components'
import getDomainName from '../../helpers/getDomainName'

var self
const styles = theme => ({
  root: { padding: 20 },
  container: { height: '100%', display: 'grid', gridTemplateColumns: '70% 30%', gap: '15px' },
  paper: { minHeight: '300px', padding: theme.spacing(2), color: theme.palette.text.primary },
  table: { minWidth: '500px' },
  tableTitle: { paddingBottom: '5px' },
  tableCell: { fontSize: '12px', border: 0 },
  warning: { color: '#d50000' },
})

export const useStyles = makeStyles(theme => ({
  root: { padding: 20 },
  container: { display: 'flex' },
  paper: { height: '84%', padding: theme.spacing(2), color: theme.palette.text.primary },
  table: { minWidth: '500px' },
  tableTitle: { paddingBottom: '5px' },
  tableCell: { fontSize: '12px' },
  warning: { color: '#d50000' },
}))

class Dashboard extends React.Component {
  constructor() {
    super()
    self = this
    this.state = {
      showPopUp: false,
      tostMsg: {},
      open: false,
    }
    this.domain = getDomainName()
    this.approveInspection = this.approveInspection.bind(this)
    this.handlePendingViewInspection = this.handlePendingViewInspection.bind(this)
  }

  componentDidMount() {
    $('#pageLoading').hide()
  }

  approveInspection(requestData, isshowPopup) {
    if (isshowPopup) {
      this.setState({ showPopUp: true })
    } else {
      $('#pageLoading').show()
      this.props.approveInspection(requestData, '', enums.approveInspectionFromType[0].id)
    }
  }

  handlePendingViewInspection(isshowPopup, inspectionId) {
    //console.log('handleViewInspection ------------')

    if (isshowPopup) {
      this.setState({ showPopUp: true })
    } else {
      var link = 'inspections/details/' + inspectionId
      history.push(link)
    }
  }

  closePopUp = () => {
    //console.log('in close popup')
    this.setState({ showPopUp: false })
  }
  render() {
    //console.log('this.props dashboard----------------', this.props)
    const { classes } = this.props
    //let tostMsg = _.get(this, ['props', 'tostMsg'], {})
    return (
      <div className={classes.root}>
        <div className={classes.container}>
          <div>
            <NewDashboardMertics />
            <AssetStates />
          </div>
          <div>
            <ActivityFeed />
          </div>
        </div>
        {this.state.showPopUp ? <PendingInspectionApprovePopup closePopUp={this.closePopUp} /> : ''}
        <Drawer anchor='right' open={this.state.open} onClose={() => this.setState({ open: false })}>
          <FormTitle title='Checked Out Assets' closeFunc={() => this.setState({ open: false })} style={{ width: '100%', fontWeight: 800 }} />
          <DashboardCheckedOutAssets assetList={_.get(this, ['props', 'dashboardList'], [])} />
        </Drawer>
      </div>
    )
  }
}

function mapState(state) {
  //console.log('Map state ------------', state.dashboardListReducer)
  if (state.dashboardListReducer.dashboardList) {
    var dashboardList = []
    dashboardList = state.dashboardListReducer.dashboardList
    if (state.dashboardListReducer.isReturnFromOutstanding) {
      if (self) {
        self.setState({ tostMsg: state.dashboardListReducer.tostMsg })
        self.props.dashboardStateUpdate()
      }
    }
    return state.dashboardListReducer
  } else {
    return state
  }
}

const actionCreators = {
  dashboardListAction: dashboardListAction,
  approveInspection: approveInspectionAction,
  dashboardStateUpdate: dashboardStateUpdate,
}
Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default connect(mapState, actionCreators)(withStyles(styles)(Dashboard))

//
{
  /* <Grid container className={classes.container} spacing={appSpacing}>
<Grid item xs={7}>
  <DashboardPendingApprovals assetList={_.get(this, ['props', 'dashboardList'], [])} approveInspection={this.approveInspection} handleViewInspection={this.handlePendingViewInspection} />
</Grid>
<Grid item xs={5}>
  <ActivityFeed />
</Grid>
{/* <Grid item xs={12} md={4}>
  <UpcomingPMs />
</Grid>
<Grid item xs={12} md={4}>
  <DashboardOutstandingIssue />
</Grid>
<Grid item xs={12} md={4}>
  <DashboardCheckedOutAssets assetList={_.get(this, ['props', 'dashboardList'], [])} />
</Grid>
</Grid> */
}
