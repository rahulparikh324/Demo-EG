import React from 'react'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'
import Typography from '@material-ui/core/Typography'
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined'
import CheckCircleOutlinedIcon from '@material-ui/icons/CheckCircleOutlined'
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import { useStyles } from './DashboardComponent'
import { withStyles } from '@material-ui/styles'
import _ from 'lodash'
import enums from '../../Constants/enums'
import Badge from '@material-ui/core/Badge'
import ImageIcon from '@material-ui/icons/Image'
import WarningIcon from '@material-ui/icons/Warning'
import Chip from '@material-ui/core/Chip'
import { history } from '../../helpers/history'
import { makeStyles } from '@material-ui/core'

const HtmlTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 500,
    maxHeight: 400,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
    overflowY: 'scroll',
  },
}))(Tooltip)

const styles = makeStyles(theme => ({
  paper: { height: '84%' },
  badge: { transform: 'scale(0.8) translate(50%, -50%)' },
  badgeRoot: { fontSize: '10px', fontWeight: 800, padding: 0, width: '16px', height: '16px', minWidth: '16px' },
  smallIcon: { fontSize: '20px' },
  tableTitle: { fontWeight: 800 },
}))

const DashboardPendingApprovals = assetList => {
  const overRideStyles = styles()
  const classes = useStyles()
  var pendingCnt = 0
  var rows = []
  const headCells = [
    { id: 'name', numeric: false, disablePadding: false, label: 'Asset Name' },
    { id: 'issues', numeric: false, disablePadding: false, label: 'New Issues' },
    { id: 'open_issues', numeric: false, disablePadding: false, label: 'Open Issues' },
    { id: 'timeElapsed', numeric: false, disablePadding: false, label: 'Time Elapsed' },
    { id: 'operatorName', numeric: false, disablePadding: false, label: 'Operator Name' },
    { id: 'actions', numeric: false, disablePadding: false, label: 'Actions' },
  ]

  const createData = (id, assetNo, notOkAttr, openIssuesCount, imageCount, newNotOkAttrCount, name, hourMeter, timeElapsed, operatorName, status, checkoutRequestDateTime, showHideApprove, Asset) => {
    return { id, assetNo, notOkAttr, openIssuesCount, imageCount, newNotOkAttrCount, name, hourMeter, timeElapsed, operatorName, status, checkoutRequestDateTime, showHideApprove, Asset }
  }
  if (_.isEmpty(assetList.assetList.pendingInspection)) {
  } else {
    pendingCnt = assetList.assetList.pendingInspection.length
    rows = []
    assetList.assetList.pendingInspection.map((value, key) => {
      const imageCount = value.image_list.image_names.length
      const notOkCount = value.new_notok_attributes.length
      const notOkAttr = value.new_notok_attributes
      var result = createData(value.inspection_id, value.internal_asset_id, notOkAttr, value.openIssuesCount, imageCount, notOkCount, value.asset_name, value.meter_hours, value.timeelapsed, `${value.operator_firstname} ${value.operator_lastname}`, value.status_name, value.datetime_requested, value.showHideApprove, value.asset)
      rows.push(result)
      return null
    })
  }

  const checkPreviosInspectionPending = function (selctedRow, rows) {
    //console.log('check Previos Inspection Pending ------------------------')
    var result = _.filter(rows, function (inspection) {
      return selctedRow.status === enums.inspectionStatus[0].status && inspection.assetNo === selctedRow.assetNo && selctedRow.checkoutRequestDateTime > inspection.checkoutRequestDateTime
    })

    //console.log('result', result, result.length)
    if (result) {
      if (result.length > 0) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }

  const handleOnClickOnPhotos = data => {
    const { id, imageCount } = data
    if (imageCount === 0) return
    history.push(`/inspections/photo/${id}`)
  }
  const handleOnClickOnIssue = data => {
    const { id } = data
    history.push(`/inspections/details/${id}`)
  }
  const redirectToIssues = data => {
    history.push({ pathname: `/issues`, state: data.Asset })
  }

  const approveInspection = function (selctedRow, rows) {
    var result = checkPreviosInspectionPending(selctedRow, rows)
    //console.log('result---------', result)

    var loginData = localStorage.getItem('loginData')
    loginData = JSON.parse(loginData)

    var inspectionData = _.filter(assetList.assetList.pendingInspection, { inspection_id: selctedRow.id })

    var requestData = {
      inspection_id: selctedRow.id,
      asset_id: _.get(inspectionData[0], ['asset_id'], ''),
      manager_id: loginData.uuid,
      status: enums.inspectionStatus[2].id,
      manager_notes: null,
      meter_hours: parseInt(selctedRow.hourMeter),
    }
    //console.log('request data---------', requestData)
    assetList.approveInspection(requestData, result)
  }
  const viewInspection = function (selctedRow, rows) {
    //console.log('view Inspection -------------------')
    var result = checkPreviosInspectionPending(selctedRow, rows)
    //console.log('result---------', result)
    assetList.handleViewInspection(result, selctedRow.id)
  }
  return (
    <Paper className={classes.paper} elevation={0}>
      <Badge badgeContent={pendingCnt} color='primary'>
        <Typography className={overRideStyles.tableTitle} style={{ paddingTop: '3px', fontFamily: 'Manrope-Medium' }}>
          Pending Reviews
        </Typography>
      </Badge>

      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100% - 25px)', height: 'calc(100% - 25px)' }}>
        <Table size='small' stickyHeader={true}>
          <TableHead>
            <TableRow>
              {headCells.map((headCell, key) => {
                return (
                  <TableCell key={key} id={headCell.id} align={headCell.numeric ? 'right' : 'left'} padding={headCell.disablePadding ? 'none' : 'normal'}>
                    {headCell.label}
                  </TableCell>
                )
              })}
            </TableRow>
          </TableHead>
          {_.isEmpty(assetList.assetList.pendingInspection) ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan='7' className='Pendingtbl-no-datafound'>
                  No data found
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {rows.map((tableRow, key) => {
                return (
                  <TableRow key={key}>
                    <TableCell className={classes.tableCell}>{tableRow.name ? tableRow.name : '-'}</TableCell>
                    <TableCell className={classes.tableCell}>
                      {tableRow.newNotOkAttrCount ? (
                        <>
                          <HtmlTooltip placement='right' title={tableRow.newNotOkAttrCount ? tableRow.notOkAttr.map(attr => <Chip size='small' key={attr.id} label={attr.name} style={{ marginRight: '5px', marginBottom: '5px' }} />) : ''}>
                            <Badge onClick={() => handleOnClickOnIssue(tableRow)} badgeContent={tableRow.newNotOkAttrCount} color='error' max={99} style={{ marginTop: '10px', cursor: 'pointer', fontSize: '10px' }} classes={{ badge: overRideStyles.badgeRoot, anchorOriginTopRightRectangular: overRideStyles.badge }}>
                              <WarningIcon fontSize='small' classes={{ fontSizeSmall: overRideStyles.smallIcon }} />
                            </Badge>
                          </HtmlTooltip>

                          <Badge onClick={() => handleOnClickOnPhotos(tableRow)} badgeContent={tableRow.imageCount} color='secondary' max={99} style={{ margin: '10px 0 0 10px', cursor: 'pointer' }} classes={{ badge: overRideStyles.badgeRoot, anchorOriginTopRightRectangular: overRideStyles.badge }}>
                            <ImageIcon fontSize='small' style={tableRow.imageCount === 0 ? { fill: '#808080' } : { fill: 'inherit' }} />
                          </Badge>
                        </>
                      ) : (
                        ''
                      )}
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      {tableRow.openIssuesCount ? (
                        <Badge onClick={() => redirectToIssues(tableRow)} badgeContent={tableRow.openIssuesCount} color='error' max={99} style={{ marginTop: '10px', cursor: 'pointer' }} classes={{ badge: overRideStyles.badgeRoot, anchorOriginTopRightRectangular: overRideStyles.badge }}>
                          <ErrorOutlineIcon fontSize='small' />
                        </Badge>
                      ) : (
                        ''
                      )}
                    </TableCell>
                    <TableCell className={classes.tableCell}>{tableRow.timeElapsed ? tableRow.timeElapsed : '-'}</TableCell>
                    <TableCell className={classes.tableCell}>{tableRow.operatorName ? tableRow.operatorName : '-'}</TableCell>

                    <TableCell className={classes.tableCell}>
                      <Tooltip title='Inspection View' placement='top'>
                        <IconButton size='small' onClick={e => handleOnClickOnIssue(tableRow, rows)}>
                          <VisibilityOutlinedIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                      {tableRow.showHideApprove && (
                        <Tooltip title='Approve' placement='top'>
                          <IconButton size='small' onClick={e => approveInspection(tableRow, rows)}>
                            <CheckCircleOutlinedIcon fontSize='small' />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          )}
        </Table>
      </div>
    </Paper>
  )
}

export default DashboardPendingApprovals
