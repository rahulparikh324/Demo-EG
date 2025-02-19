import React, { useState, useEffect } from 'react'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'
import { makeStyles } from '@material-ui/styles'
import TableLoader from '../TableLoader'
import _ from 'lodash'
import filterPMtems from '../../Services/Maintainance/filterPMItems.service'

const useStyles = makeStyles(theme => ({
  root: { paddingTop: '10px', flexGrow: 1 },
  paper: { height: '100%', padding: theme.spacing(2) },
  infoTitle: { fontSize: '16px', fontWeight: 800, padding: '12px 18px', fontFamily: 'Manrope-Medium' },
  tableCell: { fontSize: '12px' },
}))

function UpcomingPMs() {
  const classes = useStyles()
  const headCells = [
    { id: 'title', numeric: false, disablePadding: false, label: 'Title' },
    { id: 'name', numeric: false, disablePadding: false, label: 'Asset Name' },
    { id: 'dueIn', numeric: false, disablePadding: false, label: 'Due In' },
  ]
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState([])
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const payload = {
          pageIndex: 0,
          pageSize: 20,
          pm_id: [],
          internal_asset_id: [],
          pm_plan_id: [],
          search_string: '',
          site_id: [],
          pm_filter_type: 1,
        }
        const res = await filterPMtems(payload)
        if (!_.isEmpty(res.data)) setRows(res.data.list)
        else setRows([])
        setLoading(false)
      } catch (error) {
        setRows([])
        setLoading(false)
      }
    })()
  }, [])
  //
  return (
    <Paper className={classes.paper} elevation={0}>
      <div className={`${classes.infoTitle} d-flex justify-content-between`}>
        <span>Upcoming PMs</span>
      </div>
      <div className='table-responsive dashboardtblScroll' id='style-1'>
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
          {loading ? (
            <TableLoader cols={3} />
          ) : _.isEmpty(rows) ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan='6' className='Pendingtbl-no-datafound'>
                  No data found
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {rows.map((tableRow, key) => {
                return (
                  <TableRow key={key}>
                    <TableCell className={classes.tableCell}>{tableRow.title}</TableCell>
                    <TableCell className={classes.tableCell}>{tableRow.asset_name}</TableCell>
                    <TableCell className={classes.tableCell}>{tableRow.due_in}</TableCell>
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

export default UpcomingPMs
