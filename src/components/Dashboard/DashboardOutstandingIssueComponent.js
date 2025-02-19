import React from 'react'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'
import Typography from '@material-ui/core/Typography'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/styles'
import _ from 'lodash'
import $ from 'jquery'
import Slide from '@material-ui/core/Grow'
import { connect } from 'react-redux'
import dashboardOutstandingIssueListAction from '../../Actions/Dashboard/dashboardOutstandingIssueAction'
import Switch from '@material-ui/core/Switch'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import momenttimezone from 'moment-timezone'
import dashboardOutstandingIssueService from '../../Services/Dashboard/dashboardOutstandingIssueService'
import Badge from '@material-ui/core/Badge'

var self
const styles = theme => ({
  root: { padding: 20, flexGrow: 1 },
  container: { display: 'flex' },
  paper: { padding: theme.spacing(2), color: theme.palette.text.primary },
  tableCell: { fontSize: '12px' },
  warning: { color: '#d50000' },
  fab: { marginRight: theme.spacing(1) },
  buttonText: { fontSize: '12px', textTransform: 'none' },
  searchInput: { fontSize: '8px' },
})

class DashboardOutstandingIssue extends React.Component {
  constructor() {
    super()
    self = this
    this.state = {
      inspectionFormAttributes: {},
      isAllRowExpand: false,
      reportList: [],
      outstandingIssueCount: 0,
    }
  }
  async componentDidMount() {
    //const loginData = JSON.parse(localStorage.getItem('loginData'))
    $('#pageLoading').show()
    await this.props.dashboardOutstandingIssueListAction()
    const issueList = await dashboardOutstandingIssueService()
    const reports = issueList.data.data.reports

    var inspectionFormAttributes = this.state.inspectionFormAttributes
    if (!_.isEmpty(reports)) {
      let issueCount = 0
      reports.map((value, key) => {
        if (!_.isEmpty(value.asset_details)) {
          value.asset_details.map((value1, key1) => {
            inspectionFormAttributes[value1.asset_id] = false
          })
        }
        issueCount += value.asset_details.length
      })
      this.setState({ outstandingIssueCount: issueCount })
    }

    this.setState({ inspectionFormAttributes: inspectionFormAttributes, reportList: reports })
  }

  handleCollapse = (e, id) => {
    var inspectionFormAttributes = this.state.inspectionFormAttributes

    if (!_.isEmpty(this.props.outstandingIssueList.reports)) {
      this.props.outstandingIssueList.reports.map((value, key) => {
        if (!_.isEmpty(value.asset_details)) {
          value.asset_details.map((value1, key1) => {
            if (value1.asset_id == id) {
              inspectionFormAttributes[value1.asset_id] = !inspectionFormAttributes[value1.asset_id]
            }
          })
        }
      })
    }
    this.setState({ inspectionFormAttributes: inspectionFormAttributes })

    var totalRowsCnt = 0
    if (!_.isEmpty(this.props.outstandingIssueList.reports)) {
      this.props.outstandingIssueList.reports.map((value, key) => {
        if (!_.isEmpty(value.asset_details)) {
          value.asset_details.map((value1, key1) => {
            totalRowsCnt++
          })
        }
      })
    }
    var selectRowstCnt = 0
    var inspectionFormAttributes1 = _.toArray(inspectionFormAttributes)
    inspectionFormAttributes1.map((value, key) => {
      //console.log(value, ' ', key)
      if (value) {
        selectRowstCnt++
      }
    })
    //console.log('selectRowstCnt', selectRowstCnt)
    //console.log('totalRowsCnt', totalRowsCnt)
    if (selectRowstCnt == totalRowsCnt) {
      this.setState({ isAllRowExpand: 'true' })
    } else {
      this.setState({ isAllRowExpand: false })
    }
  }
  handleExpandAllRows = allRows => {
    if (!this.state.isAllRowExpand) {
      //console.log('in if')
      var allinspectionFormAttributes = {}
      allRows.map((value, key) => {
        allinspectionFormAttributes[value.id] = true
      })
      //console.log('allinspectionFormAttributes', allinspectionFormAttributes)
      this.setState({ isAllRowExpand: 'true', inspectionFormAttributes: allinspectionFormAttributes })
    } else {
      var allinspectionFormAttributes = {}
      allRows.map((value, key) => {
        allinspectionFormAttributes[value.id] = false
      })
      this.setState({ isAllRowExpand: false, inspectionFormAttributes: allinspectionFormAttributes })
    }
    //console.log(this.state.inspectionFormAttributes)
  }
  render() {
    //let tostMsg = _.get(this, ['props', 'tostMsg'], {})
    //console.log('tostMsg-------', tostMsg)
    //console.log('-----', _.get(this.props.outstandingIssueList, 'reports[0].modified_at', null))

    let utcTime = _.get(this.props.outstandingIssueList, 'reports[0].modified_at', null)
    //var local_date = momenttimezone.utc(utcTime).local().format(' MM-DD-YYYY hh:mm a')
    //console.log('local_date - ', local_date)

    var local_date2 = momenttimezone.utc(utcTime)
    local_date2 = local_date2.tz('America/Los_Angeles').format(' MM-DD-YYYY hh:mm a')
    //console.log('local_date2 - ', local_date2)

    const { classes } = this.props
    var rows = []
    const headCells = [
      { id: 'name', numeric: false, disablePadding: false, label: 'Asset Name' },
      { id: 'assetId', numeric: false, disablePadding: false, label: 'Asset Id' },
      { id: 'site', numeric: false, disablePadding: false, label: 'Site' },
      { id: 'totaloutstandinIssue', numeric: false, disablePadding: false, label: 'Outstanding Issues' },
    ]
    const createData = (id, name, assetId, site, totaloutstandinIssue, notOkAsset) => {
      return { id, name, assetId, site, totaloutstandinIssue, notOkAsset }
    }

    if (_.isEmpty(this.props.outstandingIssueList)) {
    } else {
      rows = []
      this.state.reportList.map((value, key) => {
        if (_.isEmpty(value.asset_details)) {
        } else {
          value.asset_details.map((value1, key1) => {
            var result = createData(value1.asset_id, value1.asset_name, value1.internal_asset_id, value1.site_name, value1.asset.length, value1.asset)
            rows.push(result)
          })
        }
      })
    }
    // Child Table
    const childheadCells = [
      // { id: 'name', numeric: false, disablePadding: false, label: ' ' },
      // { id: 'assetId', numeric: false, disablePadding: false, label: '' },
      { id: 'attributes', numeric: false, disablePadding: false, label: 'Attributes' },
      { id: 'timeElapsed', numeric: false, disablePadding: false, label: 'Time Elapsed' },
    ]

    return (
      <Paper className={classes.paper} elevation={0}>
        <Badge badgeContent={this.state.outstandingIssueCount} color='primary'>
          <Typography style={{ fontWeight: 800 }}>Outstanding Issues</Typography>
        </Badge>
        <FormControlLabel style={{ paddingTop: '26px' }} control={<Switch checked={this.state.isAllRowExpand == 'true' ? true : false} onChange={e => this.handleExpandAllRows(rows)} color='primary' size='medium' />} className='expandBtn' label='Expand All' />
        <div className='lastUpdateTime'>Last Updated: {local_date2 != 'Invalid date' ? local_date2 : ''}</div>

        <div className='table-responsive'>
          <div id='style-1' className='dashboardtblScroll'>
            <Table className={classes.table} size='small' stickyHeader={true}>
              <TableHead>
                <TableRow>
                  {headCells.map(headCell => (
                    <TableCell key={headCell.id} id={headCell.id} align={headCell.numeric ? 'right' : 'left'} padding={headCell.disablePadding ? 'none' : 'normal'}>
                      {headCell.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              {_.isEmpty(rows) ? (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan='4' className='Pendingtbl-no-datafound'>
                      No data found
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : (
                <TableBody>
                  {rows.map(tableRow => (
                    <React.Fragment key={tableRow.id}>
                      <TableRow onClick={e => this.handleCollapse(e, tableRow.id)}>
                        <TableCell className={classes.tableCell}>{tableRow.name}</TableCell>
                        <TableCell className={classes.tableCell}>{tableRow.assetId}</TableCell>
                        <TableCell className={classes.tableCell}>{tableRow.site}</TableCell>
                        <TableCell className={classes.tableCell}>{tableRow.totaloutstandinIssue}</TableCell>
                      </TableRow>
                      {this.state.inspectionFormAttributes[tableRow.id] && (
                        <TableRow id={tableRow.id}>
                          <TableCell colSpan='4' className={classes.tableCell}>
                            <Slide direction='down' timeout={1000} in={true}>
                              <div className='innertblscroll'>
                                <Table className={classes.table + ' innerdashboardtbl'} size='small' classes='childtable'>
                                  <TableHead>
                                    <TableRow>
                                      {childheadCells.map(headCell => (
                                        <TableCell id={headCell.id} align={headCell.numeric ? 'right' : 'left'} padding={headCell.disablePadding ? 'none' : 'normal'}>
                                          {headCell.label}
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  </TableHead>

                                  <TableBody>
                                    {tableRow.notOkAsset.map(tableRow1 => (
                                      <TableRow>
                                        {/* <TableCell className={classes.tableCell}></TableCell>
                                                            <TableCell className={classes.tableCell}></TableCell> */}
                                        <TableCell className={classes.tableCell} width='75%'>
                                          {tableRow1.attribute_name}
                                        </TableCell>
                                        <TableCell className={classes.tableCell} width='25%'>
                                          {' '}
                                          {tableRow1.time_elapsed}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </Slide>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              )}
            </Table>
          </div>
        </div>
      </Paper>
    )
  }
}
function mapState(state) {
  if (state.dashboardListReducer.outstandingIssueList) {
    if (state.dashboardListReducer) {
      if (self) {
        setTimeout(() => {
          self.setState({ tostMsg: state.dashboardListReducer.tostMsg })
        }, 100)
      }
    }
    return state.dashboardListReducer
  } else {
    return state
  }
}

const actionCreators = { dashboardOutstandingIssueListAction }
DashboardOutstandingIssue.propTypes = { classes: PropTypes.object.isRequired }

export default connect(mapState, actionCreators)(withStyles(styles)(DashboardOutstandingIssue))
