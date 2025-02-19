import React, { useState, useEffect } from 'react'
import Drawer from '@material-ui/core/Drawer'
import { FormTitle } from '../Maintainance/components'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'
import TableLoader from '../TableLoader'
import IconButton from '@material-ui/core/IconButton'
import _ from 'lodash'
import getWOGridView from '../../Services/WorkOrder/getWOGridView.js'
import CheckIcon from '@material-ui/icons/Check'
import NotInterestedIcon from '@material-ui/icons/NotInterested'
import PauseCircleOutlineIcon from '@material-ui/icons/PauseCircleOutline'
import { makeStyles } from '@material-ui/core/styles'
import updateWOCategoryTaskStatus from '../../Services/WorkOrder/updateWOCategoryTaskStatus'
import CircularProgress from '@material-ui/core/CircularProgress'
import { Toast } from '../../Snackbar/useToast'
import enums from '../../Constants/enums'
import Input from '@material-ui/core/Input'
import InputAdornment from '@material-ui/core/InputAdornment'
import SearchOutlined from '@material-ui/icons/SearchOutlined'
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined'
import { MinimalFilterSelector } from '../Assets/components'
import FilterListIcon from '@material-ui/icons/FilterList'
import RejectCategoryTask from './RejectCategoryTask'
import Button from '@material-ui/core/Button'
import ReactExport from 'react-data-export'

const ExcelFile = ReactExport.ExcelFile
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn

const useStyles = makeStyles(theme => ({
  tableCell: { fontSize: '12px', fontWeight: 400 },
}))

function ViewForm({ open, onClose, obj, afterSubmit, woStatusId }) {
  //
  const classes = useStyles()
  const [loading, setLoading] = useState(true)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [tasks, setTasks] = useState([])
  const [unfilteredTasks, setUnfilteredTasks] = useState([])
  const [actionLoading, setActionLoading] = useState(false)
  const [loadingID, setLoadingID] = useState('')
  const [loadingAction, setLoadingAction] = useState('')
  const [searchStringValue, setSearchStringValue] = useState('')
  const [statusFilterOpts, setStatusFilterOpts] = useState([])
  const [statusFilter, setStatusFilter] = useState(null)
  const [techFilterOpts, setTechFilterOpts] = useState([])
  const [techFilter, setTechFilter] = useState(null)
  const [dynamicFields, setDynamicFields] = useState([])
  const [reload, setReload] = useState(0)
  const [isRejectReasonModalOpen, setRejectReasonModalOpen] = useState(false)
  const [selectedTaskCategoryMappingId, setSelectedTaskCategoryMappingId] = useState('')
  const [excelData, setExcelData] = useState([])
  //
  useEffect(() => {
    setLoading(true)
    const makeUniqueArray = val => [...new Set(val.map(s => JSON.stringify(s)))].map(k => JSON.parse(k))
    ;(async () => {
      try {
        const list = await getWOGridView(obj.wo_inspectionsTemplateFormIOAssignment_id)
        // console.log(list.data)
        const status_opts = []
        const tech_opts = []
        const excelData = []
        list.data.task_list.forEach(d => {
          status_opts.push({
            label: enums.WO_STATUS.find(x => x.value === d.status_id) ? enums.WO_STATUS.find(x => x.value === d.status_id).label : '',
            value: d.status_id,
          })
          if (d.technician_id) tech_opts.push({ label: d.technician_name, value: d.technician_id })
          let objx = {}
          const ifd = d.inspection_form_data || d.inspection_form_data !== 'null' ? JSON.parse(d.inspection_form_data) : {}
          if (ifd) Object.keys(ifd).forEach(d => (objx = { ...objx, ...ifd[d] }))
          const dynamicFields = list.data.dynamic_fields || []
          const row = {
            serial_number: d.serial_number,
            asset_name: d.asset_name,
            location: d.location,
            technician_name: d.technician_name,
            status_name: d.status_name,
          }
          dynamicFields.forEach(field => (row[field.key] = _.get(objx, field.key, '')))
          excelData.push(row)
        })
        setExcelData(excelData)
        setStatusFilterOpts(makeUniqueArray(status_opts))
        setTechFilterOpts(makeUniqueArray(tech_opts))
        setTasks(list.data.task_list)
        list.data.dynamic_fields && setDynamicFields(list.data.dynamic_fields)
        setUnfilteredTasks(list.data.task_list)
        setLoading(false)
      } catch (error) {
        console.log(error)
        setTasks([])
        setLoading(false)
      }
    })()
  }, [reload])
  const getStatus = status => {
    const { color, label } = enums.WO_STATUS.find(d => d.value === status)
    return <span style={{ padding: '2px 12px', borderRadius: '8px', background: `${color}33`, color, border: `1px solid ${color}`, whiteSpace: 'nowrap' }}>{label}</span>
  }
  //
  const handleAction = (type, obj) => {
    setActionLoading(true)
    setLoadingAction(type)
    if (type === 'ACCEPT') updateTaskStatus(obj, enums.woTaskStatus.Complete)
    if (type === 'REJECT') {
      setSelectedTaskCategoryMappingId(obj.wOcategorytoTaskMapping_id)
      setRejectReasonModalOpen(true)
    }
    if (type === 'HOLD') updateTaskStatus(obj, enums.woTaskStatus.Hold)
  }
  const updateTaskStatus = async (obj, status) => {
    setLoadingID(obj.wOcategorytoTaskMapping_id)
    try {
      const payload = { wOcategorytoTaskMapping_id: obj.wOcategorytoTaskMapping_id, status }
      const res = await updateWOCategoryTaskStatus(payload)
      if (res.success > 0) Toast.success('Status updated successfully!')
      else Toast.error(res.message)
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
    }
    setActionLoading(false)
    setLoadingAction('')
    setLoadingID('')
    setReload(p => p + 1)
  }
  const handleSearchOnKeyDown = e => {
    const filteredData = !statusFilter && !techFilter ? [...unfilteredTasks] : []
    if (statusFilter && !techFilter) unfilteredTasks.forEach(d => d.status_id === statusFilter.value && filteredData.push(d))
    else if (!statusFilter && techFilter) unfilteredTasks.forEach(d => d.technician_id === techFilter.value && filteredData.push(d))
    else if (statusFilter && techFilter) unfilteredTasks.forEach(d => d.technician_id === techFilter.value && d.status_id === statusFilter.value && filteredData.push(d))
    const tasks = filteredData.filter(d => {
      const asset_name = d.asset_name || ''
      const asset_id = d.asset_id || ''
      const technician_name = d.technician_name || ''
      const location = d.location || ''
      return asset_name.toLowerCase().includes(searchStringValue.toLowerCase()) || asset_id.toLowerCase().includes(searchStringValue.toLowerCase()) || location.toLowerCase().includes(searchStringValue.toLowerCase()) || technician_name.toLowerCase().includes(searchStringValue.toLowerCase())
    })
    setTasks(tasks)
  }
  const clearSearch = () => {
    setSearchStringValue('')
    setTasks(unfilteredTasks)
  }
  const handleClose = () => {
    onClose()
    afterSubmit()
  }
  //filter change
  useEffect(() => {
    handleSearchOnKeyDown()
  }, [statusFilter, techFilter])
  //
  return (
    <Drawer anchor='right' open={open} onClose={handleClose}>
      <FormTitle title={obj.form_category_name} closeFunc={handleClose} style={{ width: '100%', minWidth: '450px' }} />
      <div className='p-2 d-flex flex-row-reverse'>
        <Input
          placeholder='Search '
          startAdornment={
            <InputAdornment position='start'>
              <SearchOutlined color='primary' />
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment className='pointerCursor' position='end' onClick={clearSearch}>
              {searchStringValue ? <CloseOutlinedIcon color='primary' fontSize='small' /> : ''}
            </InputAdornment>
          }
          value={searchStringValue}
          onChange={e => setSearchStringValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearchOnKeyDown()}
        />
        <ExcelFile
          element={
            <Button size='small' variant='contained' color='primary' className='nf-buttons mr-3' disableElevation>
              Export Excel
            </Button>
          }
        >
          <ExcelSheet data={excelData} name='GirdData'>
            <ExcelColumn label='Sr.No' value='serial_number' />
            <ExcelColumn label='Identification' value='asset_name' />
            <ExcelColumn label='Parent' value='location' />
            <ExcelColumn label='Technician' value='technician_name' />
            <ExcelColumn label='Status' value='status_name' />
            {dynamicFields.map((field, ind) => (
              <ExcelColumn key={ind} label={field.value} value={field.key}></ExcelColumn>
            ))}
          </ExcelSheet>
        </ExcelFile>
      </div>
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 120px)', height: 'calc(100vh - 120px)', padding: '0 10px 10px 10px', width: '90vw' }}>
        <Table size='small' stickyHeader={true}>
          <TableHead>
            <TableRow className='TCH'>
              <TableCell onClick={() => setIsFilterOpen(!isFilterOpen)}>Sr.No</TableCell>
              <TableCell onClick={() => setIsFilterOpen(!isFilterOpen)}>Identification</TableCell>
              <TableCell onClick={() => setIsFilterOpen(!isFilterOpen)}>Parent</TableCell>
              <TableCell onClick={() => setIsFilterOpen(!isFilterOpen)}>
                Technician <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
              </TableCell>
              <TableCell onClick={() => setIsFilterOpen(!isFilterOpen)}>
                Status <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
              </TableCell>
              {dynamicFields.map((field, ind) => (
                <TableCell key={ind} onClick={() => setIsFilterOpen(!isFilterOpen)}>
                  {field.value}
                </TableCell>
              ))}
              {woStatusId !== 15 && <TableCell onClick={() => setIsFilterOpen(!isFilterOpen)}>Actions</TableCell>}
            </TableRow>
            {isFilterOpen && (
              <TableRow>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell>
                  <MinimalFilterSelector isClearable placeholder='Select Technician' value={techFilter} onChange={setTechFilter} options={techFilterOpts} label='Technician' />
                </TableCell>
                <TableCell>
                  <MinimalFilterSelector isClearable placeholder='Select Status' value={statusFilter} onChange={setStatusFilter} options={statusFilterOpts} label='Status' />
                </TableCell>
                {dynamicFields.map(field => (
                  <TableCell key={field}></TableCell>
                ))}
                {woStatusId !== 15 && <TableCell></TableCell>}
              </TableRow>
            )}
          </TableHead>
          {loading ? (
            <TableLoader cols={6} />
          ) : _.isEmpty(tasks) ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan='6' className={' Pendingtbl-no-datafound'}>
                  No Tasks found
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {tasks.map(cat => {
                let objx = {}
                const ifd = cat.inspection_form_data || cat.inspection_form_data !== 'null' ? JSON.parse(cat.inspection_form_data) : {}
                if (ifd) {
                  Object.keys(ifd).forEach(d => {
                    objx = { ...objx, ...ifd[d] }
                  })
                }
                return (
                  <TableRow key={cat.wOcategorytoTaskMapping_id}>
                    <TableCell className={classes.tableCell}>{cat.serial_number}</TableCell>
                    <TableCell className={classes.tableCell}>{cat.asset_name}</TableCell>
                    <TableCell className={classes.tableCell}>{cat.location}</TableCell>
                    <TableCell className={classes.tableCell}>{cat.technician_name || '-'}</TableCell>
                    <TableCell className={classes.tableCell}>{getStatus(cat.status_id)}</TableCell>
                    {dynamicFields.map(field => (
                      <TableCell key={field.key} className={classes.tableCell}>
                        {objx[field.key]}
                      </TableCell>
                    ))}
                    {woStatusId !== 15 && (
                      <TableCell align='left' padding='normal' className={classes.tableCell}>
                        {cat.status_id === enums.woTaskStatus.ReadyForReview && (
                          <>
                            <IconButton onClick={() => handleAction('ACCEPT', cat)} aria-label='more' aria-controls='long-menu' aria-haspopup='true' size='small'>
                              {loadingID === cat.wOcategorytoTaskMapping_id && loadingAction === 'ACCEPT' && actionLoading ? <CircularProgress size={20} thickness={5} /> : <CheckIcon fontSize='small' style={{ color: '#438C09' }} />}
                            </IconButton>
                            <IconButton onClick={() => handleAction('REJECT', cat)} aria-label='more' aria-controls='long-menu' aria-haspopup='true' size='small'>
                              {loadingID === cat.wOcategorytoTaskMapping_id && loadingAction === 'REJECT' && actionLoading ? <CircularProgress size={20} thickness={5} /> : <NotInterestedIcon fontSize='small' style={{ color: '#F44336' }} />}
                            </IconButton>
                            <IconButton onClick={() => handleAction('HOLD', cat)} aria-label='more' aria-controls='long-menu' aria-haspopup='true' size='small'>
                              {loadingID === cat.wOcategorytoTaskMapping_id && loadingAction === 'HOLD' && actionLoading ? <CircularProgress size={20} thickness={5} /> : <PauseCircleOutlineIcon fontSize='small' style={{ color: '#FF9D33' }} />}
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          )}
        </Table>
      </div>
      {isRejectReasonModalOpen && <RejectCategoryTask woTaskCategoryMappingId={selectedTaskCategoryMappingId} open={isRejectReasonModalOpen} afterSubmit={() => setReload(p => p + 1)} onClose={() => setRejectReasonModalOpen(false)} />}
    </Drawer>
  )
}

export default ViewForm
