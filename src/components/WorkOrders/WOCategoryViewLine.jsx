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
import getWOCategoryTaskByCategoryID from '../../Services/WorkOrder/getWOCategoryTaskByCategoryID'
import getAllWOCategoryTaskByWOId from '../../Services/WorkOrder/getAllWOCategoryTaskByWOId'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'
import { makeStyles } from '@material-ui/core/styles'
import _ from 'lodash'
import { Form } from 'react-formio'
import getFormByWOTaskId from '../../Services/WorkOrder/getFormByWOTaskId'
import copyFieldsFrom from 'Services/WorkOrder/copyFieldsFrom'
import Button from '@material-ui/core/Button'
import updateWOCategoryTaskStatus from '../../Services/WorkOrder/updateWOCategoryTaskStatus'
import { Toast } from '../../Snackbar/useToast'
import enums from '../../Constants/enums'
import CircularProgress from '@material-ui/core/CircularProgress'
import deleteWOCategoryTask from '../../Services/WorkOrder/deleteWOCategoryTask'
import WOViewLineMultiCopy from './WOViewLineMultiCopy'
import Input from '@material-ui/core/Input'
import InputAdornment from '@material-ui/core/InputAdornment'
import SearchOutlined from '@material-ui/icons/SearchOutlined'
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined'
import FilterListIcon from '@material-ui/icons/FilterList'
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField'
import RotateLeftSharpIcon from '@material-ui/icons/RotateLeftSharp'
import Grid from '@material-ui/core/Grid'
import RejectCategoryTask from './RejectCategoryTask'
import EditOutlinedIcon from '@material-ui/icons/EditOutlined'
import Checkbox from '@material-ui/core/Checkbox'
import CloseIcon from '@material-ui/icons/Close'
import { MinimalButton } from 'components/common/buttons'
import addUpdateAssetForm from 'Services/FormIO/addUpdateAssetForm'

const useStyles = makeStyles(theme => ({
  menu: { padding: 0, fontSize: 13, boxShadow: '1px 2px 4px 1px #8080800a' },
  tableCell: { fontSize: '12px', fontWeight: 400, '&:hover': { cursor: 'pointer' } },
  workOrderStatus: { padding: '2px 12px', borderRadius: '4px', color: 'white' },
  paneHeader: {
    borderTop: '1px solid #A6A6A6',
    background: '#fff',
    marginTop: 'auto',
    padding: '12px',
  },
  headRoot: { cursor: 'pointer', '&:hover': { background: '#e0e0e0 !important' } },
  headFilter: { paddingRight: 0 },
  listbox: { fontSize: 12, '&::-webkit-scrollbar': { width: '0.4em' }, '&::-webkit-scrollbar-thumb': { background: '#e0e0e0' } },
  LoadingWrapper: { fontSize: 12 },
  inputRoot: { display: 'flex', flexDirection: 'Column', alignItems: 'flex-start', '&[class*="MuiOutlinedInput-root"] .MuiAutocomplete-input': { width: '100%', fontSize: '12px' } },
  btnGreen: { color: '#fff !important', backgroundColor: '#48A825 !important', borderColor: '#48A825 !important', '&:hover': { backgroundColor: '#3b8c1d !important', borderColor: '#3b8c1d !important' }, '&:disabled': { opacity: '.65', boxShadow: 'none' } },
  btnRed: { color: '#fff !important', backgroundColor: '#FF0000 !important', borderColor: '#FF0000 !important', '&:hover': { backgroundColor: '#e30000 !important', borderColor: '#e30000 !important' }, '&:disabled': { opacity: '.65', boxShadow: 'none' } },
  btnOrange: { color: '#fff !important', backgroundColor: '#ff9d13 !important', borderColor: '#ff9d13 !important', '&:hover': { backgroundColor: '#e49321 !important', borderColor: '#e49321 !important' }, '&:disabled': { opacity: '.65', boxShadow: 'none' } },
}))

function WOCategoryViewLine({ open, onClose, obj, woStatusId, woType, isShowAllTask, woId }) {
  const filterEnums = {
    STATUS: 'STATUS',
    TECHNICIAN: 'TECHNICIAN',
  }
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState([])
  const [originalRows, setOriginalRows] = useState([])
  const [anchorEl, setAnchorEl] = useState(null)
  const classes = useStyles()
  const [rowSelected, setRowSelected] = useState([])
  const [anchorSelectedViewLine, setAnchorSelectedViewLine] = useState({})
  const [selectedViewLineObject, setSelectedViewLineObject] = useState({})
  const [viewLineFormObject, setViewLineFormObject] = useState({})
  const [formLoading, setFormLoading] = useState(true)
  const [acceptButtonLoading, setAcceptButtonLoading] = useState(false)
  const [rowLoading, setRowLoading] = useState(false)
  const [multiCopyModalOpen, setMultiCopyModalOpen] = useState(false)
  const [searchString, setSearchString] = useState('')
  const [searchStringValue, setSearchStringValue] = useState('')
  const [allStatusLists, setAllStatusLists] = useState([])
  const [allTechnicianList, setAllTechnicianList] = useState([])
  const [primaryFilterName, setPrimaryFilterName] = useState('')
  const [filterForColumn, setFilterForColumn] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [filterForStatus, setFilterForStatus] = useState(0)
  const [selectedTechnician, setSelectedTechnician] = useState([])
  const [filterForTechnician, setFilterForTechnician] = useState([])
  const [clearFilterButton, setClearFilterButton] = useState(true)
  const [isRejectReasonModalOpen, setRejectReasonModalOpen] = useState(false)
  const [isCopyFromOneFormOpen, setIsCopyFromOneFormOpen] = useState(false)
  const [isCopyFromOneFormLoading, setIsCopyFromOneFormLoading] = useState(false)
  const [isFormInEditMode, setFormInEditMode] = useState(false)
  const [checkboxObj, setCheckBox] = useState({})
  const [formDataToSubmit, setFormDataToSubmit] = useState({})
  const [isSubmitLoading, setSubmitLoading] = useState(false)
  const [currentTaskForm, setCurrentTaskForm] = useState({})
  const [loadingStatus, setLoadingStatus] = useState(0)
  const [dataLoading, setDataLoading] = useState(true)
  const newSubmissionData = {}
  let isSubmissionDataValid = false
  //console.log(obj)
  // load
  useEffect(() => {
    ;(async () => {
      setAllStatusLists(enums.workOrderTaskStatusList)
      await fetchViewLineList()
    })()
  }, [])

  const fetchViewLineList = async (isPreviouseRowSelected = false) => {
    try {
      //clear filter and search on list load again
      setLoading(true)
      setDataLoading(true)
      let res = null
      if (isShowAllTask) {
        res = await getAllWOCategoryTaskByWOId(woId)
      } else {
        let woAssignmentID = obj.wo_inspectionsTemplateFormIOAssignment_id
        res = await getWOCategoryTaskByCategoryID({ id: woAssignmentID })
      }
      if (res != null && res.success === 1) {
        setAnchorEl(null)
        setAnchorSelectedViewLine(null)
        if (isPreviouseRowSelected === false) {
          setSelectedViewLineObject(null)
        }
        setRows(res.data)
        setOriginalRows(res.data)

        if (res.data != null && res.data.length > 0) {
          //if row is previously selected then put row already selected and don't do api call to load form
          if (isPreviouseRowSelected && selectedViewLineObject != null) {
            let selectedRowObject = res.data.find(e => e.wOcategorytoTaskMapping_id === selectedViewLineObject.wOcategorytoTaskMapping_id)
            if (selectedRowObject && selectedRowObject != null) {
              //update selected object for status updation
              setSelectedViewLineObject(selectedRowObject)
              handleRowClick(null, selectedRowObject)
            } else {
              handleRowClick(null, res.data[0])
            }
          } else {
            handleRowClick(null, res.data[0])
          }
          let technicianList = res.data.filter(el => el.technician_id != null && el.technician_name != null).map(x => ({ id: x.technician_id, name: x.technician_name }))
          const finalUniqueList = [...new Map(technicianList.map(item => [item['technician_id'], item])).values()]
          setAllTechnicianList(finalUniqueList)
        } else {
          handleRowClick(null, null, true)
        }
        setLoading(false)
        if (!clearFilterButton) filterViewTasks()
      } else {
        setRows([])
        setLoading(false)
        setFormLoading(false)
      }
    } catch (error) {
      console.log(error)
      setRows([])
      setFormLoading(false)
      setLoading(false)
    }
  }

  const getStatus = status => {
    const { color, label } = enums.WO_STATUS.find(d => d.value === status)
    return (
      <span
        style={{
          padding: '2px 10px',
          fontWeight: 800,
          borderRadius: '8px',
          fontSize: '10px',
          background: `${color}33`,
          color,
          border: `1px solid ${color}`,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    )
  }

  const isRowSelected = wOcategorytoTaskMapping_id => rowSelected.indexOf(wOcategorytoTaskMapping_id) !== -1

  const handleRowClick = (event, rowObject, isNoData = false) => {
    if (event) {
    }
    //if click on row action icon don't do anything
    if (event && event.target.id && (event.target.id === 'viewline_action_menu' || event.target.id === 'viewline_action_more_icon')) return
    //if click on row action menu don't change selection
    if (event && typeof event.target.className === 'string' && event.target.className && event.target.className != '' && event.target.className.indexOf('viewline_action_li') > -1) {
      return
    }
    //if user click same view line row don't do anything
    if (event != null && selectedViewLineObject != null && rowObject != null && rowObject.wOcategorytoTaskMapping_id === selectedViewLineObject.wOcategorytoTaskMapping_id) return

    //if user click inside of table body row then its should do selection
    if ((event === null && isNoData === false) || (event && typeof event.target.className === 'string' && event.target.className != '' && event.target.className.indexOf('MuiTableCell-body') > -1)) {
      let newSelected = []
      newSelected.push(rowObject.wOcategorytoTaskMapping_id)
      setRowSelected(newSelected)
      showViewLineForm(rowObject)
    } else if (isNoData) {
      showViewLineForm(null)
    }
  }

  const showViewLineForm = async selectedItem => {
    if (selectedItem != null) {
      setSelectedViewLineObject(selectedItem)
      try {
        let woTaskMappingId = selectedItem.wOcategorytoTaskMapping_id
        setFormLoading(true)
        setViewLineFormObject(null)
        const res = await getFormByWOTaskId({ id: woTaskMappingId })
        if (res.success === 1) {
          setFormLoading(false)
          if (res.data !== null) {
            let formObj
            if (isShowAllTask) {
              const { wo_inspectionsTemplateFormIOAssignment_id } = res.data
              const f = obj.form_category_list.find(d => d.wo_inspectionsTemplateFormIOAssignment_id === wo_inspectionsTemplateFormIOAssignment_id)
              formObj = JSON.parse(f.form_data)
            } else {
              formObj = JSON.parse(obj.form_data)
            }
            let form = _.isEmpty(res.data.asset_form_data) ? {} : JSON.parse(res.data.asset_form_data)
            //console.log(form)
            setFormDataToSubmit(form)
            setCurrentTaskForm(res.data)
            setViewLineFormObject({ ...formObj })
            setDataLoading(false)
          }
        } else {
          setFormLoading(false)
          setDataLoading(true)
        }
      } catch (error) {
        console.log(error)
        setFormLoading(false)
        setDataLoading(false)
      }
    }
  }

  const handleClickListItem = (event, selectedObj) => {
    setAnchorEl(event.currentTarget)
    setAnchorSelectedViewLine(selectedObj)
  }

  const handleAction = async type => {
    setAnchorEl(null)
    if (type === 'DELETE') deleteViewLineTask(anchorSelectedViewLine)
    if (type === 'ACCEPT') await updateViewLineTaskStatus(anchorSelectedViewLine, enums.woTaskStatus.Complete)
    if (type === 'REJECT') setRejectReasonModalOpen(true)
    if (type === 'HOLD') await updateViewLineTaskStatus(anchorSelectedViewLine, enums.woTaskStatus.Hold)
    if (type === 'MULTI_COPY') setMultiCopyModalOpen(true)
    if (type === 'COPY_DATA') setIsCopyFromOneFormOpen(true)
  }

  const updateViewLineTaskStatus = async (viewlineRequest, status, isFromForm = false) => {
    try {
      if (isFromForm) {
        setAcceptButtonLoading(true)
        setLoadingStatus(status)
      } else {
        setRowLoading(true)
      }
      let payload = {
        wOcategorytoTaskMapping_id: viewlineRequest.wOcategorytoTaskMapping_id,
        status: status,
      }
      const res = await updateWOCategoryTaskStatus(payload)
      if (res.success === 1) {
        if (isFromForm) {
          setAcceptButtonLoading(false)
          setLoadingStatus(0)
        } else {
          setRowLoading(false)
        }
        Toast.success('Status updated successfully!')
        await fetchViewLineList(true)
      } else {
        if (isFromForm) {
          setAcceptButtonLoading(false)
          setLoadingStatus(0)
        } else {
          setRowLoading(false)
        }
        Toast.error(res.message)
      }
    } catch (error) {
      Toast.error('Something went wrong !')
      if (isFromForm) {
        setAcceptButtonLoading(false)
        setLoadingStatus(0)
      } else {
        setRowLoading(false)
      }
    }
  }

  const deleteViewLineTask = async viewlineRequest => {
    try {
      setRowLoading(true)
      let payload = {
        wOcategorytoTaskMapping_id: viewlineRequest.wOcategorytoTaskMapping_id,
      }
      const res = await deleteWOCategoryTask(payload)
      if (res.success === 1) {
        setRowLoading(false)
        Toast.success('Record deleted successfully!')
        await fetchViewLineList()
      } else {
        setRowLoading(false)
        Toast.error(res.message)
      }
    } catch (error) {
      setRowLoading(false)
      Toast.error('Something went wrong !')
    }
  }

  const afterMultiCopySuccess = async () => {
    await fetchViewLineList(true)
  }

  const handleSearchOnKeyDown = e => {
    setSearchString(searchStringValue)
  }

  const clearSearch = () => {
    setSearchString('')
    setSearchStringValue('')
  }

  const clickOnHeaderCell = () => setFilterForColumn(!filterForColumn)

  const handleStatusFilterChange = (e, val) => {
    setPrimaryFilterName(checkAndSetPrimaryFilter(filterEnums.STATUS))
    setFilterForStatus(val ? val.id : 0)
    setSelectedStatus(val)
  }
  const handleTechnicianFilterChange = (e, val) => {
    setPrimaryFilterName(checkAndSetPrimaryFilter(filterEnums.TECHNICIAN))
    setFilterForTechnician(val && val.length !== 0 ? val.map(m => m.id) : [])
    setSelectedTechnician(val)
  }

  const checkAndSetPrimaryFilter = filter => (primaryFilterName === '' ? filter : primaryFilterName)

  //*------------------Column Filter & search----------------------------
  useEffect(() => {
    ;(() => {
      filterViewTasks()
    })()
  }, [searchString, selectedStatus, selectedTechnician])

  const filterViewTasks = () => {
    const actualRows = [...originalRows]
    let filteredRow = []
    //search functionality
    if (!_.isEmpty(searchString)) {
      filteredRow = actualRows.filter(
        x =>
          (x.asset_name !== null && x.asset_name.toLowerCase().includes(searchString.toLowerCase())) ||
          (x.asset_id !== null && x.asset_id.toLowerCase().includes(searchString.toLowerCase())) ||
          (x.location !== null && x.location.toLowerCase().includes(searchString.toLowerCase())) ||
          (x.technician_name !== null && x.technician_name.toLowerCase().includes(searchString.toLowerCase()))
      )
    } else {
      filteredRow = actualRows
    }
    //filter functionality
    if (primaryFilterName === filterEnums.STATUS && filterForStatus != 0) {
      filteredRow = filteredRow.filter(x => x.status_id == filterForStatus)
    }
    if (primaryFilterName === filterEnums.TECHNICIAN && filterForTechnician.length > 0) {
      filteredRow = filteredRow.filter(x => filterForTechnician.some(y => y === x.technician_id))
    }
    checkClearFilterDisablity()
    setRows(filteredRow)
    //after search and filter show first row selected
    if (filteredRow && filteredRow.length > 0) {
      handleRowClick(null, filteredRow[0])
    }
  }

  //clear filter
  const clearFilters = () => {
    setPrimaryFilterName('')
    setFilterForColumn(false)
    setFilterForStatus(0)
    setFilterForTechnician([])
    setSelectedTechnician([])
    setSelectedStatus(null)
  }

  const checkClearFilterDisablity = () => {
    if (selectedStatus != null || (selectedTechnician != null && selectedTechnician.length > 0)) {
      setClearFilterButton(false)
      setFilterForColumn(true)
    } else {
      setClearFilterButton(true)
      setFilterForColumn(false)
      setPrimaryFilterName('')
    }
  }
  const copyFromForm = async () => {
    const arr = []
    Object.keys(checkboxObj).forEach(key => checkboxObj[key] === true && arr.push(key))
    const payload = {
      copy_from_wOcategorytoTaskMapping_id: anchorSelectedViewLine.wOcategorytoTaskMapping_id,
      copy_to_wOcategorytoTaskMapping_id: arr,
    }
    setIsCopyFromOneFormLoading(true)
    try {
      const res = await copyFieldsFrom(payload)
      if (res.success > 0) Toast.success('Data copied successfully !')
      else Toast.error(res.message)
    } catch (error) {
      Toast.error('Something went wrong !')
    }
    setIsCopyFromOneFormLoading(false)
    setIsCopyFromOneFormOpen(false)
    setCheckBox({})
    afterMultiCopySuccess()
  }
  //*----other components
  const renderCopyFormConfirmView = () => {
    if (!isCopyFromOneFormOpen) return
    return (
      <div className={classes.paneHeader} style={{ borderTop: '1px solid #eee', position: 'absolute', bottom: '1px', right: 0, width: '100%' }}>
        <Button variant='contained' color='primary' className='nf-buttons mr-2' onClick={copyFromForm} disableElevation disabled={isCopyFromOneFormLoading || _.isEmpty(Object.keys(checkboxObj).filter(key => checkboxObj[key] === true))}>
          {isCopyFromOneFormLoading ? 'Copying...' : 'Copy'}
          {isCopyFromOneFormLoading && <CircularProgress size={20} thickness={5} style={{ color: '#fff', marginLeft: '10px' }} />}
        </Button>
        <Button variant='contained' color='default' className='nf-buttons mr-2' disableElevation onClick={() => setIsCopyFromOneFormOpen(false)}>
          Cancel
        </Button>
      </div>
    )
  }
  const renderEditModeControls = () => (
    <div className='d-flex'>
      <MinimalButton loading={isSubmitLoading && loadingStatus === 70} disabled={isSubmitLoading && loadingStatus === 70} text='Submit' loadingText='Submiting...' onClick={() => submitFormData(70)} variant='contained' color='primary' baseClassName='mr-2' />
      <MinimalButton loading={isSubmitLoading && loadingStatus === 13} disabled={isSubmitLoading && loadingStatus === 13} text='Save' loadingText='Saving...' onClick={() => submitFormData(13)} variant='contained' color='primary' />
    </div>
  )
  const renderSubmittedFormControls = () => {
    const isDisabled = rowLoading || woStatusId === enums.woTaskStatus.Complete || (selectedViewLineObject !== null && selectedViewLineObject.status_id !== enums.woTaskStatus.ReadyForReview)
    return (
      <>
        <MinimalButton
          onClick={() => updateViewLineTaskStatus(selectedViewLineObject, enums.woTaskStatus.Complete, true)}
          loading={acceptButtonLoading && loadingStatus === enums.woTaskStatus.Complete}
          text='Accept'
          loadingText='Accepting...'
          variant='contained'
          color='primary'
          disabled={isDisabled || _.isEmpty(rows) || loading}
          baseClassName={`${classes.btnGreen} mr-2`}
        />
        <MinimalButton
          onClick={() => updateViewLineTaskStatus(selectedViewLineObject, enums.woTaskStatus.Hold, true)}
          loading={acceptButtonLoading && loadingStatus === enums.woTaskStatus.Hold}
          text='Hold'
          loadingText='Holding...'
          variant='contained'
          color='primary'
          disabled={isDisabled || _.isEmpty(rows) || loading}
          baseClassName={`${classes.btnOrange} mr-2`}
        />
        <MinimalButton onClick={() => handleAction('REJECT')} text='Reject' variant='contained' color='primary' disabled={isDisabled || _.isEmpty(rows) || loading} baseClassName={`${classes.btnRed} mr-2`} />
      </>
    )
  }
  const renderEditButton = () => {
    if ([enums.woTaskStatus.Complete, enums.woTaskStatus.Submitted].includes(currentTaskForm.status)) return
    return (
      <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 120 }}>
        {!isFormInEditMode ? (
          <IconButton onClick={() => setFormInEditMode(true)}>
            <EditOutlinedIcon />
          </IconButton>
        ) : (
          <IconButton onClick={() => setFormInEditMode(false)}>
            <CloseIcon />
          </IconButton>
        )}
      </div>
    )
  }
  //*----
  const submitFormData = async status => {
    if (!isSubmissionDataValid) {
      Toast.error('Fill all the required fields !')
      return
    }
    const { asset_form_id, asset_form_name, form_id, asset_form_type, asset_form_description } = currentTaskForm
    const asset_form_data = JSON.stringify(newSubmissionData)
    const payload = { asset_form_id, asset_form_name, form_id, asset_form_type, asset_form_description, asset_form_data, status }
    setSubmitLoading(true)
    setLoadingStatus(status)
    try {
      const res = await addUpdateAssetForm(payload)
      if (res.success > 0) Toast.success(`Form submitted successfully !`)
      else Toast.error(res.message)
      setSubmitLoading(false)
      setLoadingStatus(0)
      setFormInEditMode(false)
      await fetchViewLineList(true)
    } catch (error) {
      setSubmitLoading(false)
      setLoadingStatus(0)
      console.log(error)
      Toast.error('Something went wrong !')
    }
  }
  const handleChangeInFormData = d => {
    newSubmissionData.data = d.data
    isSubmissionDataValid = d.isValid
  }
  //
  useEffect(() => {
    setFormLoading(true)
    setTimeout(() => setFormLoading(false), 600)
  }, [isFormInEditMode])

  //
  return (
    <div>
      <Drawer anchor='right' open={open} onClose={onClose}>
        <FormTitle title={isShowAllTask ? 'View Tasks' : !_.isEmpty(obj) ? 'Type - ' + obj.form_category_name : 'Type'} closeFunc={onClose} style={{ width: '100%', minWidth: '450px' }} />
        <div style={{ width: '95vw' }}>
          <div className='d-flex'>
            <div style={{ maxHeight: 'calc(100vh - 64px)', height: 'calc(100vh - 64px)', width: '40%', borderRight: '1px solid #eee' }}>
              <div className='d-flex flex-row justify-content-between align-items-center' style={{ width: '100%', padding: '18px 16px' }}>
                <div>
                  <Input
                    placeholder='Search'
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
                </div>
                <Button size='small' onClick={() => clearFilters()} disabled={clearFilterButton} startIcon={<RotateLeftSharpIcon />} variant='contained' color='primary' className='nf-buttons' disableElevation>
                  Reset Filters
                </Button>
              </div>

              <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 224px)', height: 'calc(100vh - 224px)', padding: '0 10px 10px 10px', borderRight: '1px solid #eee', position: 'relative' }}>
                <Table size='small' stickyHeader={true}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sr No</TableCell>
                      <TableCell>Identification</TableCell>
                      <TableCell>Parent</TableCell>
                      <TableCell onClick={() => clickOnHeaderCell('Technician')} classes={{ root: classes.headRoot }} style={selectedTechnician.length !== 0 ? { background: '#eeeeee' } : { background: '#fafafa' }} id='Technician' align='left' padding='normal'>
                        {'Technician'}
                        <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
                      </TableCell>
                      <TableCell onClick={() => clickOnHeaderCell('Status')} classes={{ root: classes.headRoot }} style={selectedStatus && selectedStatus.length !== 0 ? { background: '#eeeeee' } : { background: '#fafafa' }} id='Status' align='left' padding='normal'>
                        {'Status'}
                        <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
                      </TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                    {filterForColumn && (
                      <TableRow>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell classes={{ root: classes.headFilter }}>
                          <Autocomplete
                            multiple
                            size='small'
                            classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                            id='technicianIdFilter'
                            value={selectedTechnician}
                            options={allTechnicianList}
                            getOptionLabel={option => option.name}
                            name='technicianIdFilter'
                            onChange={(e, val) => handleTechnicianFilterChange(e, val)}
                            noOptionsText='No technician found'
                            renderInput={params => <TextField {...params} className='filter-input-disable-lastpass' variant='outlined' margin='normal' placeholder='Select Technician' name='technicianId' />}
                          />
                        </TableCell>
                        <TableCell>
                          <Autocomplete
                            size='small'
                            classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                            id='statusIdFilter'
                            value={selectedStatus}
                            options={allStatusLists}
                            getOptionLabel={option => option.status}
                            name='statusIdFilter'
                            onChange={(e, val) => handleStatusFilterChange(e, val)}
                            noOptionsText='No status found'
                            renderInput={params => <TextField {...params} className='filter-input-disable-lastpass' variant='outlined' margin='normal' fullWidth placeholder='Select Status' name='statusId' />}
                          />
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    )}
                  </TableHead>
                  {loading ? (
                    <TableLoader cols={6} />
                  ) : _.isEmpty(rows) ? (
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan='6' className={' Pendingtbl-no-datafound'}>
                          No data found
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  ) : (
                    <TableBody>
                      {rows.map((tableRow, key) => {
                        const isItemSelected = isRowSelected(tableRow.wOcategorytoTaskMapping_id)
                        return (
                          <TableRow onClick={event => handleRowClick(event, tableRow)} tabIndex={-1} key={tableRow.wOcategorytoTaskMapping_id} selected={isItemSelected} hover>
                            <TableCell className={classes.tableCell}>{tableRow.serial_number}</TableCell>
                            <TableCell className={classes.tableCell}>{tableRow.asset_name ? tableRow.asset_name : '-'}</TableCell>
                            <TableCell className={classes.tableCell}>{tableRow.location ? tableRow.location : '-'}</TableCell>
                            <TableCell className={classes.tableCell}>{tableRow.technician_name ? tableRow.technician_name : '-'}</TableCell>
                            <TableCell className={classes.tableCell}>{getStatus(tableRow.status_id)}</TableCell>
                            <TableCell className={classes.tableCell}>
                              {isCopyFromOneFormOpen ? (
                                <>
                                  {anchorSelectedViewLine && tableRow.wOcategorytoTaskMapping_id !== anchorSelectedViewLine.wOcategorytoTaskMapping_id && tableRow.status_id !== enums.woTaskStatus.Complete && (
                                    <Checkbox color='primary' size='small' checked={!!checkboxObj[tableRow.wOcategorytoTaskMapping_id]} onChange={e => setCheckBox({ ...checkboxObj, [tableRow.wOcategorytoTaskMapping_id]: e.target.checked })} />
                                  )}
                                </>
                              ) : (
                                <>
                                  {rowLoading && anchorSelectedViewLine.wOcategorytoTaskMapping_id === tableRow.wOcategorytoTaskMapping_id ? (
                                    <CircularProgress size={20} thickness={5} />
                                  ) : (
                                    <span>
                                      <IconButton aria-label='more' aria-controls='long-menu' aria-haspopup='true' onClick={e => handleClickListItem(e, tableRow)} size='small' id='viewline_action_more_icon'>
                                        <MoreVertIcon fontSize='small' id='viewline_action_menu' />
                                      </IconButton>
                                      <Menu classes={{ paper: classes.menu }} anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                                        {/* If work order completed then user can not perform multi copy */}
                                        {woType !== 0 && woType === 66 && (
                                          <MenuItem className={classes.tableCell + ' viewline_action_li'} onClick={() => handleAction('MULTI_COPY')} disabled={woStatusId === enums.woTaskStatus.Complete}>
                                            Multi - Copy
                                          </MenuItem>
                                        )}
                                        <MenuItem className={classes.tableCell + ' viewline_action_li'} onClick={() => handleAction('COPY_DATA')} disabled={woStatusId === enums.woTaskStatus.Complete || (anchorSelectedViewLine != null && anchorSelectedViewLine.status_id === enums.woTaskStatus.Open)}>
                                          Copy Data To
                                        </MenuItem>
                                        <MenuItem
                                          className={classes.tableCell + ' viewline_action_li'}
                                          onClick={() => handleAction('DELETE')}
                                          disabled={woStatusId === enums.woTaskStatus.Complete || (anchorSelectedViewLine !== null && (anchorSelectedViewLine.status_id === enums.woTaskStatus.Complete || anchorSelectedViewLine.status_id === enums.woTaskStatus.Submitted || anchorSelectedViewLine.is_parent_task))}
                                        >
                                          Delete
                                        </MenuItem>
                                      </Menu>
                                    </span>
                                  )}
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  )}
                </Table>
              </div>
              {renderCopyFormConfirmView()}
            </div>

            <div style={{ width: '60%' }}>
              <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 126px)', height: 'calc(100vh - 126px)', padding: '10px', borderRight: '1px solid #eee', position: 'relative' }}>
                {formLoading || dataLoading ? (
                  <div className='d-flex justify-content-center align-items-center' style={{ height: '100%' }}>
                    <CircularProgress size={20} thickness={5} />
                  </div>
                ) : _.isEmpty(rows) ? (
                  <div className='d-flex justify-content-center align-items-center' style={{ height: '100%' }}>
                    Not Data to show !
                  </div>
                ) : (
                  <>
                    {renderEditButton()}
                    {!isFormInEditMode ? <div className='workorder-viewline-form'>{<Form form={viewLineFormObject} submission={formDataToSubmit} options={{ readOnly: true }} />}</div> : <div className='workorder-viewline-form'>{<Form form={viewLineFormObject} onChange={d => handleChangeInFormData(d)} submission={formDataToSubmit} />}</div>}
                  </>
                )}
              </div>
              <div className={classes.paneHeader} style={{ borderTop: '1px solid #eee' }}>
                {isFormInEditMode && renderEditModeControls()}
                {!isFormInEditMode && renderSubmittedFormControls()}
              </div>
            </div>
          </div>
        </div>
      </Drawer>
      {multiCopyModalOpen && <WOViewLineMultiCopy open={multiCopyModalOpen} handleClose={() => setMultiCopyModalOpen(false)} afterSubmit={() => afterMultiCopySuccess()} obj={anchorSelectedViewLine} />}
      {isRejectReasonModalOpen && <RejectCategoryTask woTaskCategoryMappingId={selectedViewLineObject.wOcategorytoTaskMapping_id} open={isRejectReasonModalOpen} afterSubmit={() => fetchViewLineList(true)} onClose={() => setRejectReasonModalOpen(false)} />}
    </div>
  )
}

export default WOCategoryViewLine
