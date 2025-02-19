import React from 'react'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'
import { useStyles } from './DashboardComponent'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import { Tooltip } from '@material-ui/core'
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined'
import _ from 'lodash'
import { history } from '../../helpers/history'

const DashboardCheckedOutAssets = assetList => {
  const classes = useStyles()
  var rows = []
  const headCells = [
    { id: 'assetNo', numeric: false, disablePadding: false, label: 'Asset No' },
    { id: 'name', numeric: false, disablePadding: false, label: 'Asset Name' },
    { id: 'timeElapsed', numeric: false, disablePadding: false, label: 'Time Elapsed' },
    { id: 'operatorName', numeric: false, disablePadding: false, label: 'Operator Name' },
    { id: 'actions', numeric: false, disablePadding: false, label: 'Actions' },
  ]
  const createData = (id, assetNo, name, timeElapsed, operatorName, status, actions) => {
    return { id, assetNo, name, timeElapsed, operatorName, status, actions }
  }
  if (_.isEmpty(assetList.assetList.checkOutAssets)) {
  } else {
    rows = []
    assetList.assetList.checkOutAssets.map((value, key) => {
      var result = createData(value.inspection_id, value.internal_asset_id, value.asset_name, value.timeelapsed, value.operator_name, value.status_name)
      rows.push(result)
      return null
    })
  }
  const viewInspection = function (inspectionId) {
    //console.log('view Inspection -------------------')
    var link = 'inspections/details/' + inspectionId
    history.push(link)
  }
  return (
    <Paper className={classes.paper} elevation={0}>
      <div className='table-responsive' style={{ marginBottom: '12px' }}>
        <div id='style-1' className='dashboardtblScroll'>
          <Table className={classes.table} size='small' stickyHeader={true}>
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
            {_.isEmpty(assetList.assetList.checkOutAssets) ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan='5' className='Pendingtbl-no-datafound'>
                    No data found
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {rows.map((tableRow, key) => {
                  return (
                    <TableRow key={key}>
                      <TableCell className={classes.tableCell}>{tableRow.assetNo ? tableRow.assetNo : '-'}</TableCell>
                      <TableCell className={classes.tableCell}>{tableRow.name ? tableRow.name : '-'}</TableCell>
                      <TableCell className={classes.tableCell}>{tableRow.timeElapsed ? tableRow.timeElapsed : '-'}</TableCell>
                      <TableCell className={classes.tableCell}>{tableRow.operatorName ? tableRow.operatorName : '-'}</TableCell>
                      <TableCell>
                        <Grid container alignItems='center'>
                          <Tooltip title='Inspection View' placement='top'>
                            <IconButton size='small' onClick={e => viewInspection(tableRow.id)}>
                              <VisibilityOutlinedIcon fontSize='small' />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            )}
          </Table>
        </div>
      </div>
    </Paper>
  )
}

export default DashboardCheckedOutAssets
