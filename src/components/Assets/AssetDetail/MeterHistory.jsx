import React, { useState, useEffect } from 'react'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'
import TableLoader from '../../TableLoader'
import TablePagination from '@material-ui/core/TablePagination'
import getMeterHourHistory from '../../../Services/Asset/getMeterHistory'
import { getDateTime } from '../../../helpers/getDateTime'
import _ from 'lodash'

function MeterHistory({ assetId, renderMH }) {
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState([])
  const [pagesize, setPageSize] = useState(20)
  const [size, setSize] = useState(0)
  const [page, setPage] = useState(0)
  const [pageindex, setPageIndex] = useState(1)

  useEffect(() => {
    setLoading(true)
    ;(async () => {
      try {
        const res = await getMeterHourHistory({ asset_id: assetId, search_string: '', pagesize, pageindex })
        // console.log(res.data)
        setRows(res.data.list)
        setSize(res.data.listsize)
        setLoading(false)
      } catch (error) {
        console.log(error)
        setRows([])
        setLoading(false)
      }
    })()
  }, [pagesize, pageindex, assetId, renderMH])

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
    setPageIndex(newPage + 1)
  }
  const handleChangeRowsPerPage = event => {
    setPage(0)
    setPageIndex(1)
    setPageSize(parseInt(event.target.value, 10))
  }

  return (
    <div style={{ height: 'calc(100% - 48px)', padding: '20px' }}>
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100% - 40px)', height: 'calc(100% - 40px)' }}>
        <Table size='small' stickyHeader={true}>
          <TableHead>
            <TableRow>
              <TableCell align='left' padding='normal' style={{ background: '#fafafa' }}>
                Updated Date
              </TableCell>
              <TableCell align='left' padding='normal' style={{ background: '#fafafa' }}>
                Meter Hours
              </TableCell>
            </TableRow>
          </TableHead>
          {loading ? (
            <TableLoader cols={2} />
          ) : _.isEmpty(rows) ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan='2' className='Pendingtbl-no-datafound'>
                  No data found
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {rows.map((tableRow, key) => {
                return (
                  <TableRow key={key}>
                    <TableCell style={{ fontSize: '12px', fontWeight: 400 }}>{getDateTime(tableRow.updated_at, tableRow.timezone)}</TableCell>
                    <TableCell style={{ fontSize: '12px', fontWeight: 400 }}>{tableRow.meter_hours}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          )}
        </Table>
      </div>
      {!_.isEmpty(rows) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={size} rowsPerPage={pagesize} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
    </div>
  )
}

export default MeterHistory
