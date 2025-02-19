import React, { useState, useEffect } from 'react'
import getAssetForm from 'Services/FormIO/getAssetForm'
import CircularProgress from '@material-ui/core/CircularProgress'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'
import TableLoader from 'components/TableLoader'
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import _ from 'lodash'
import '../formio.css'

import ViewForm from '../ViewForm'
import { getDateTime } from 'helpers/getDateTime'
import TablePagination from '@material-ui/core/TablePagination'
import getFormJson from 'Services/FormIO/get-form-json'
import equipments from 'Services/equipments'
import useFetchData from 'hooks/fetch-data'
import { getApplicationStorageItem } from 'helpers/getStorageItem'

function Forms({ assetId }) {
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState([])
  const [viewFormOpen, setViewFormOpen] = useState(false)
  const [formToView, setFormToView] = useState({})
  const [createFormOpen, setCreateFormOpen] = useState(false)
  const [formToCreate, setFormToCreate] = useState({})
  const [render, setRender] = useState(0)
  const [pagesize, setPageSize] = useState(20)
  const [size, setSize] = useState(0)
  const [page, setPage] = useState(0)
  const [pageindex, setPageIndex] = useState(1)
  //const checkUserRole = new getUserRole()
  const [formLoading, setFormLoading] = useState('')
  const { data: equipmentListOptions } = useFetchData({ fetch: equipments.getAllEquipmentList, payload: { pageSize: 0, pageIndex: 0, siteId: getApplicationStorageItem('siteId'), searchString: '', equipmentNumber: [], manufacturer: [], modelNumber: [], calibrationStatus: [] }, formatter: d => _.get(d, 'data.list', []) })

  useEffect(() => {
    setLoading(true)
    ;(async () => {
      try {
        const res = await getAssetForm({
          assetId,
          pagesize,
          pageindex,
          initial_start_date_time: null,
          initial_end_date_time: null,
          filter_asset_name: [],
          wO_ids: [],
          inspected_by: [],
          accepted_by: [],
          status: [],
          service_type: [],
          search_string: '',
        })
        if (res.data != null) {
          setSize(res.data.listsize)
          setRows(res.data.list)
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
  }, [assetId, render, pageindex, pagesize])
  const onView = async data => {
    try {
      setFormLoading(data.asset_form_id)
      const res = await getFormJson({ form_id: data.form_id, asset_form_id: data.asset_form_id })
      setFormLoading('')
      setFormToView({ asset_form_data: res.data.asset_form_data, asset_form_description: data.asset_form_description })
      setViewFormOpen(true)
    } catch (error) {
      console.log(error)
      setFormLoading('')
    }
  }
  const onCreate = () => {
    setFormToCreate(rows.length === 1 ? rows[0] : rows[1])
    setCreateFormOpen(true)
  }
  //
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
    <div style={{ height: '100%', marginTop: '8px' }}>
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ minHeight: '95%' }}>
        <Table size='small' stickyHeader={true}>
          <TableHead>
            <TableRow>
              <TableCell align='left' padding='normal' style={{ background: '#fafafa' }}>
                Inspection Datetime
              </TableCell>
              <TableCell align='left' padding='normal' style={{ background: '#fafafa' }}>
                Inspected By
              </TableCell>
              <TableCell align='left' padding='normal' style={{ background: '#fafafa' }}>
                Inspection Classification
              </TableCell>
            </TableRow>
          </TableHead>
          {loading ? (
            <TableLoader cols={3} />
          ) : _.isEmpty(rows) ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan='3' className='Pendingtbl-no-datafound'>
                  No data found
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {rows.map((tableRow, key) => {
                return (
                  <TableRow key={key} onClick={() => onView(tableRow)} className='table-with-row-click'>
                    <TableCell style={{ fontSize: '12px', fontWeight: 400 }}>{getDateTime(tableRow.inspected_at, tableRow.timezone)}</TableCell>
                    <TableCell style={{ fontSize: '12px', fontWeight: 400 }}>{tableRow.requested_by}</TableCell>
                    <TableCell style={{ fontSize: '12px', fontWeight: 400 }}>
                      <div className='d-flex justify-content-between align-items-center' style={{ width: '100%', height: '26px' }}>
                        {_.startCase(_.get(tableRow, 'form_retrived_workOrderType', '-'))}
                        <CircularProgress size={20} thickness={5} style={{ marginRight: '6px', visibility: formLoading === tableRow.asset_form_id ? 'visible' : 'hidden' }} />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          )}
        </Table>
      </div>
      {!_.isEmpty(rows) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={size} rowsPerPage={pagesize} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
      {viewFormOpen && <ViewForm equipmentListOptions={equipmentListOptions} viewObj={formToView} open={viewFormOpen} onClose={() => setViewFormOpen(false)} />}
    </div>
  )
}

export default Forms
