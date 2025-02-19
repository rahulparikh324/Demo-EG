import React, { useState, useEffect } from 'react'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'
import TableLoader from '../../TableLoader'
import TablePagination from '@material-ui/core/TablePagination'
import getChildrenAssets from '../../../Services/Asset/get-children-assets'
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import _ from 'lodash'
import { history } from '../../../helpers/history'

function SubComponents({ assetId }) {
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
        const res = await getChildrenAssets(assetId)
        // console.log(res.data)
        if (res.data != null) {
          setRows(res.data.list)
          setSize(res.data.listsize)
        } else {
          setRows([])
        }
        setLoading(false)
      } catch (error) {
        console.log(error)
        setRows([])
        setLoading(false)
      }
    })()
  }, [pagesize, pageindex, assetId])
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
    setPageIndex(newPage + 1)
  }
  const handleChangeRowsPerPage = event => {
    setPage(0)
    setPageIndex(1)
    setPageSize(parseInt(event.target.value, 10))
  }

  const HeaderCell = ({ name }) => (
    <TableCell align='left' padding='normal' style={{ background: '#fafafa' }}>
      {name}
    </TableCell>
  )
  const viewDetails = id => history.push({ pathname: `../../../assets/details/${id}` })

  return (
    <div style={{ height: 'calc(100% - 48px)', padding: '20px' }}>
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100% - 40px)', height: 'calc(100% - 40px)' }}>
        <Table size='small' stickyHeader={true}>
          <TableHead>
            <TableRow>
              <HeaderCell name='Identification' />
              <HeaderCell name='Level' />
              <HeaderCell name='Facility' />
            </TableRow>
          </TableHead>
          {loading ? (
            <TableLoader cols={3} />
          ) : _.isEmpty(rows) ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan='4' className='Pendingtbl-no-datafound'>
                  No data found
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {rows.map((tableRow, key) => {
                return (
                  <TableRow key={key} onClick={() => viewDetails(tableRow.asset_id)} className='table-with-row-click'>
                    <TableCell style={{ fontSize: '12px', fontWeight: 400 }}>{tableRow.asset_name}</TableCell>
                    <TableCell style={{ fontSize: '12px', fontWeight: 400 }}>{tableRow.levels}</TableCell>
                    <TableCell style={{ fontSize: '12px', fontWeight: 400 }}>{tableRow.site_name}</TableCell>
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

export default SubComponents
