import React, { useState, useEffect, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import { FormTitle } from '../Maintainance/components'
import AddIcon from '@material-ui/icons/Add'
import LinkIcon from '@material-ui/icons/Link'
import AttachFileIcon from '@material-ui/icons/AttachFile'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import _ from 'lodash'
import '../Maintainance/maintainance.css'
import clsx from 'clsx'
import { PriorityControl } from '../Requests/components'
import assetTabFilterOptions from '../../Services/Asset/assetNameFilterOptions'
import { FormAccordian } from '../Maintainance/components'
import uploadWOAttachment from '../../Services/WorkOrder/uploadWOAttachment'
import addUpdateWO from '../../Services/WorkOrder/addUpdateWO'
import { Toast } from '../../Snackbar/useToast'
import AddTaskModal from './AddTaskModal'
import AddIssueModal from './AddIssueModal'
import { TaskItem, IssueItem, AttachmentItem } from './components'
import getServiceDealers from '../../Services/Maintainance/getServiceDealers'
import { MinimalInput, MinimalDatePicker, MinimalTextArea, MinimalAutoComplete } from '../Assets/components'
import * as yup from 'yup'
import { validateSchema } from '../../helpers/schemaValidation'
import { utils } from 'react-modern-calendar-datepicker'
import { components } from 'react-select'
import getAllAssetForTree from '../../Services/Asset/getAllAssetTree'

const useStyles = makeStyles(theme => ({
  root: { padding: 0, flexGrow: 1, height: 'calc(100vh - 68px)' },
  paper: { padding: theme.spacing(2), color: theme.palette.text.primary },
  input: { margin: '16px 16px 0 16px', width: '92%' },
  radio: { margin: '16px 16px 0 16px', fontSize: '14px' },
  radioLabel: { fontSize: '14px', margin: 0 },
  containerDiv: { display: 'flex', flexDirection: 'column', height: '100%', width: '450px', background: '#efefef' },
  containerSubDiv: { borderRadius: '4px', margin: '8px', display: 'flex', flexDirection: 'column', background: '#fff', maxHeight: '830px', overflowY: 'scroll', '&::-webkit-scrollbar': { width: '0.2em' }, '&::-webkit-scrollbar-thumb': { background: '#e0e0e0' } },
  subTitile: { padding: '12px 16px', background: '#eee', fontSize: '16px', fontWeight: 500, border: '1px solid #d1d1d1', borderLeft: 0, borderRight: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  button: { padding: '4px 16px', borderRadius: '40px', margin: theme.spacing(1), margin: 0, textTransform: 'capitalize' },
  taskError: { color: 'red', textAlign: 'center' },
  paneHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #A6A6A6', padding: '12px' },
  button: { padding: '2px 14px', margin: theme.spacing(1), borderRadius: '16px', margin: 0, textTransform: 'capitalize' },
  formButtons: { padding: '6px 18px', borderRadius: '40px' },
  bottomBar: { borderTop: '1px solid #A6A6A6', borderBottom: 'none', background: '#fff', marginTop: 'auto' },
  listbox: {
    maxHeight: '180px',
    overflowY: 'scroll',
    '&::-webkit-scrollbar': {
      width: '0.4em',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#e0e0e0',
    },
    fontSize: '14px',
  },
  LoadingWrapper: { fontSize: 12 },
  badge: { transform: 'scale(0.8) translate(50%, -50%)' },
  inputRoot: {
    display: 'flex',
    flexDirection: 'Column',
    alignItems: 'flex-start',
    '&[class*="MuiOutlinedInput-root"] .MuiAutocomplete-input': {
      width: '100%',
    },
  },
}))

const styles = {
  paneHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #A6A6A6', padding: '12px' },
  bottomBar: { borderTop: '1px solid #A6A6A6', borderBottom: 'none', background: '#fff', marginTop: 'auto' },
  labelStyle: { fontWeight: 800 },
  inputStyle: { background: 'none', padding: '10px 16px', border: '1px solid #a1a1a1' },
  labelError: { color: 'red', fontWeight: 800 },
  inputError: { background: '#ff000021', padding: '10px 16px', border: '1px solid red', color: 'red', marginBottom: '-5px' },
}

function CreateWorkorder({ open, onClose, afterSubmit, woObj, fromMR }) {
  const classes = useStyles()
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState(45)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [pageIndex, setPageIndex] = useState(1)
  const [searchString, setSearchString] = useState('')
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [AssetOptions, setAssetOptions] = useState([])
  const [AssetsLoading, setAssetsLoading] = useState(false)
  const [tasks, setTasks] = useState([])
  const [issues, setIssues] = useState([])
  const uploadInputRef = useRef(null)
  const [attachments, setAttachments] = useState([])
  const [attachmentUploading, setAttachmentUploading] = useState(false)
  const [isAddTaskModalOpen, setAddTaskModalOpen] = useState(false)
  const [isAddIssueModalOpen, setAddIssueModalOpen] = useState(false)
  const [desc, setDesc] = useState('')
  const [selectedDealer, setSelectedDealer] = useState(null)
  const [dealerOptions, setDealerOptions] = useState([])
  const [pageIndexForDealer, setPageIndexForDealer] = useState(1)
  const [searchStringForDealer, setSearchStringForDealer] = useState('')
  const [dealersLoading, setDealersLoading] = useState(false)
  const [date, setDate] = useState(utils().getToday())
  let typingTimer = null
  //data loading
  const getFilterOptionsPayload = () => ({
    pagesize: 20,
    pageindex: pageIndex,
    site_id: [],
    status: 1,
    asset_id: [],
    internal_asset_id: [],
    model_name: [],
    model_year: [],
    show_open_issues: 0,
    search_string: '',
    option_search_string: searchString,
    company_id: [],
  })
  useEffect(() => {
    ;(async () => {
      setAssetsLoading(true)
      try {
        const assetNameOpts = await getAllAssetForTree()
        setAssetOptions(assetNameOpts.data.map(asset => ({ ...asset, label: asset.name, value: asset.internal_asset_id })))
      } catch (error) {
        console.log(error)
        setAssetOptions([])
      }
      if (fromMR) {
        // console.log(woObj)
        setTitle(woObj.title)
        setSelectedAsset({ ...woObj.asset, label: woObj.asset.name, value: woObj.asset.asset_id })
      }
      setAssetsLoading(false)
    })()
    return () => clearTimeout(typingTimer)
  }, [])
  const scrolledToBottom = async event => {
    setPageIndex(prev => prev + 1)
    try {
      const payload = getFilterOptionsPayload()
      const assetNameOpts = await assetTabFilterOptions('FilterAssetNameOptions', { ...payload, pageindex: pageIndex + 1 })
      const d = [...AssetOptions, ...assetNameOpts.list]
      setAssetOptions(d.map(asset => ({ ...asset, label: asset.name, value: asset.asset_id })))
    } catch (error) {
      console.log(error)
      setAssetOptions(AssetOptions)
    }
  }
  const scrolledToBottomDealers = async event => {
    setPageIndexForDealer(prev => prev + 1)
    try {
      const dealers = await getServiceDealers({ pageIndex: pageIndexForDealer + 1, searchString: searchStringForDealer })
      const d = [...dealerOptions, ...dealers.data.list]
      setDealerOptions(d.map(d => ({ ...d, name_email: `${d.name} - ${d.email}`, label: `${d.name} - ${d.email}`, value: d.service_dealer_id })))
    } catch (error) {
      setDealerOptions(dealerOptions)
    }
  }
  const handleSearch = val => {
    clearTimeout(typingTimer)
    if (!_.isEmpty(val)) {
      typingTimer = setTimeout(async () => {
        setSearchString(val)
        setPageIndex(1)
        searchAssets(val)
      }, 700)
    }
  }
  const searchAssets = async val => {
    setAssetsLoading(true)
    try {
      //console.log('search string change', selectedAsset, val)
      const payload = getFilterOptionsPayload()
      const assetNameOpts = await assetTabFilterOptions('FilterAssetNameOptions', { ...payload, pageindex: 1, option_search_string: val })
      //console.log(assetNameOpts.list)
      setAssetOptions(assetNameOpts.list.map(asset => ({ ...asset, label: asset.name, value: asset.asset_id })))
    } catch (error) {
      console.log(error)
      setAssetOptions([])
    }
    setAssetsLoading(false)
  }
  const onCloseDD = () => {
    setSearchString('')
    setPageIndex(1)
    searchAssets('')
  }
  //form functions
  const closeForm = () => {
    setTitle('')
    setPriority(45)
    setSelectedAsset(null)
    setSelectedDealer(null)
    setErrors({})
    setTasks([])
    setIssues([])
    setDesc('')
    setAttachments([])
    setDate(utils().getToday())
    onClose(false)
  }
  const validateForm = async () => {
    const schema = yup.object().shape({
      title: yup.string().required('Title is required !').max(100, 'Title can not be more than 100 characters !'),
      desc: yup.string().required('Description is required !'),
      asset: yup.string().required('Asset is required !'),
      tasks: yup.array(),
    })
    const payload = { title, desc, asset: selectedAsset ? selectedAsset.asset_id : '', tasks }
    const isValid = await validateSchema(payload, schema)
    // console.log(isValid)
    setErrors(isValid)
    if (isValid === true) createRequestBody()
  }
  const onFocus = key => setErrors({ ...errors, [key]: null })
  const createRequestBody = async () => {
    const req = {
      title,
      asset_id: selectedAsset.asset_id,
      description: desc,
      priority,
      due_at: new Date(date.year, date.month - 1, date.day, 12).toISOString().split('T')[0],
      wo_type: 59,
      WorkOrderTasks: tasks.map(task => ({ task_id: task.task_id, STATUS: 12 })),
      issue: issues.map(iss => ({ issue_id: iss.issue_uuid, mr_id: iss.mr_id, is_archive: false })),
      workOrderAttachments: attachments.map(att => ({ user_uploaded_name: att.user_uploaded_name, filename: att.filename })),
      service_dealer_id: selectedDealer ? selectedDealer.service_dealer_id : null,
    }
    if (fromMR) {
      req.mr_id = woObj.mr_id
      req.wo_type = woObj.mr_type === 53 ? 60 : 61
    }
    setLoading(true)
    // console.log(req)
    submitData(req)
  }
  const submitData = async data => {
    try {
      // console.log(data)
      const res = await addUpdateWO(data)
      if (res.success > 0) Toast.success('Workorder created successfully !')
      else Toast.error(res.message)
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
    }
    setLoading(false)
    closeForm()
    afterSubmit()
  }
  //issue functions
  const handleAddIssueClick = () => {
    if (_.isEmpty(selectedAsset)) setErrors({ ...errors, asset: { error: true, msg: 'Asset must be selected first to link Issues !' } })
    else setAddIssueModalOpen(true)
  }
  const deleteIssueFromList = id => {
    const remainingTasks = issues.filter(task => task.issue_uuid !== id)
    setIssues(remainingTasks)
  }
  //tasks functions
  const handleAddTaskClick = () => {
    onFocus('tasks')
    setAddTaskModalOpen(true)
  }
  const deleteTaskFromList = id => {
    const remainingTasks = tasks.filter(task => task.task_id !== id)
    setTasks(remainingTasks)
  }
  //attachments functions
  const addAttachment = e => {
    e.preventDefault()
    if (!e.target.files[0]) return
    const reader = new FileReader()
    const file = e.target.files[0]
    setAttachmentUploading(true)
    reader.onloadend = () => {}
    reader.readAsDataURL(file)
    uploadAttachment(file)
    e.target.value = null
  }
  const deleteAttachment = attachment => setAttachments(attachments.filter(att => att.filename !== attachment.filename))
  const uploadAttachment = async file => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await uploadWOAttachment(formData)
      // console.log(res)
      if (res.success > 0) {
        setAttachments([
          ...attachments,
          {
            file,
            url: res.data.file_url,
            user_uploaded_name: res.data.user_uploaded_name,
            filename: res.data.filename,
          },
        ])
        setAttachmentUploading(false)
      } else Toast.error(res.message)
    } catch (error) {
      Toast.error('Something went wrong !')
    }
  }
  //vendor
  useEffect(() => {
    ;(async () => {
      setDealersLoading(true)
      try {
        const dealers = await getServiceDealers({ pageIndex: pageIndexForDealer, searchString: searchStringForDealer })
        const _dealers = dealers.data.list.map(d => ({ ...d, name_email: `${d.name} - ${d.email}`, label: `${d.name} - ${d.email}`, value: d.service_dealer_id }))
        setDealerOptions(_dealers)
        //console.log('fetched Vendors', _dealers)
      } catch (error) {
        console.log(error)
        setDealerOptions([])
      }
      setDealersLoading(false)
    })()
    return () => clearTimeout(typingTimer)
  }, [])
  const handleDealerSearch = val => {
    clearTimeout(typingTimer)
    typingTimer = setTimeout(async () => {
      setPageIndexForDealer(1)
      setSearchStringForDealer(val)
      searchDealers(val)
    }, 700)
  }
  const searchDealers = async val => {
    setDealersLoading(true)
    try {
      const dealers = await getServiceDealers({ pageIndex: 1, searchString: val })
      const _dealers = dealers.data.list.map(d => ({ ...d, name_email: `${d.name} - ${d.email}`, label: `${d.name} - ${d.email}`, value: d.service_dealer_id }))
      setDealerOptions(_dealers)
    } catch (error) {
      console.log(error)
      setDealerOptions([])
    }
    setDealersLoading(false)
  }
  const onCloseDealer = () => {
    setSearchStringForDealer('')
    setPageIndexForDealer(1)
    searchDealers('')
  }
  //
  const Option = props => {
    return (
      <div>
        <components.Option {...props}>
          <div style={{ fontSize: 14, fontWeight: 800 }}>{props.data.name}</div>
          <div style={{ fontSize: 12, color: '#939393' }}>{props.data.email}</div>
        </components.Option>
      </div>
    )
  }
  //
  return (
    <>
      <Drawer anchor='right' open={open} onClose={() => closeForm()}>
        <FormTitle title='Create Work Order' closeFunc={() => closeForm()} />
        <div className={classes.containerDiv}>
          <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 126px)', height: 'calc(100vh - 126px)', overflowX: 'hidden' }}>
            {/* form */}
            <div style={{ padding: '16px', background: '#fff', borderRadius: '4px', margin: '10px' }}>
              <MinimalInput value={title} onChange={setTitle} error={errors.title} label='Title' placeholder='Add Title' w={100} labelStyles={styles.labelStyle} InputStyles={styles.inputStyle} onFocus={e => onFocus('title')} />
              <MinimalTextArea onFocus={e => onFocus('desc')} rows={3} value={desc} error={errors.desc} onChange={e => setDesc(e.target.value)} placeholder='Add Description ..' label='Description' w={100} labelStyles={errors.desc ? styles.labelError : styles.labelStyle} InputStyles={errors.desc ? styles.inputError : styles.inputStyle} />
              <MinimalAutoComplete
                isDisabled={fromMR}
                onFocus={e => onFocus('asset')}
                placeholder='Search Asset ID/Name'
                value={selectedAsset}
                onChange={setSelectedAsset}
                options={AssetOptions}
                label='Select Asset'
                w={100}
                isClearable
                isLoading={AssetsLoading}
                labelStyles={{ fontWeight: 800 }}
                inputStyles={{ background: 'none', padding: '2px 6px', border: '1px solid #a1a1a1' }}
                errorStyles={{ background: '#ff000021', border: '1px solid red', color: 'red' }}
                error={errors.asset}
              />
              <PriorityControl value={priority} onChange={setPriority} />
              <MinimalDatePicker date={date} setDate={setDate} label='Due Date' w={100} labelStyles={styles.labelStyle} InputStyles={styles.inputStyle} />
            </div>

            {/* issues */}
            <FormAccordian count={issues.length} title='Issues' style={{ borderRadius: '4px', margin: '8px', background: '#fff' }} bg>
              <div className='d-flex flex-row justify-content-end p-3'>
                <Button variant='contained' size='small' color='primary' startIcon={<LinkIcon />} onClick={handleAddIssueClick} className='nf-buttons' disableElevation>
                  Link Issue
                </Button>
              </div>
              <div className='schedule-triggers tasks justify-content-start align-items-center' style={{ gap: '0' }}>
                {issues.map(issue => (
                  <IssueItem key={issue.issue_uuid} inspectionID={issue.inspection_id} meters={issue.inspections.meter_hours} status={issue.status} code={`#${issue.issue_number}`} title={issue.name} onDelete={() => deleteIssueFromList(issue.issue_uuid)} />
                ))}
              </div>
            </FormAccordian>
            {/* tasks */}
            <FormAccordian count={tasks.length} title='Tasks' error={errors.tasks} style={{ borderRadius: '4px', margin: '8px', background: '#fff' }} bg>
              <div className='d-flex flex-row justify-content-end p-3'>
                <Button variant='contained' size='small' color='primary' startIcon={<AddIcon />} name='task_error' onClick={handleAddTaskClick} className='nf-buttons' disableElevation>
                  Add Task
                </Button>
              </div>
              <div className='schedule-triggers tasks justify-content-start align-items-center' style={{ gap: '0' }}>
                {tasks.map(task => (
                  <TaskItem isCreate readOnly key={task.task_id} task={task} code={`#${task.task_code}`} title={task.task_title} time={task.task_est_display} onDelete={() => deleteTaskFromList(task.task_id)} />
                ))}
              </div>
            </FormAccordian>
            {/* Dealer */}
            {/* <FormAccordian title='Service Dealer' style={{ borderRadius: '4px', margin: '8px', background: '#fff' }} bg>
              <div style={{ padding: '12px' }}>
                <MinimalAutoComplete components={{ Option }} placeholder='Search by Name/Email' scrollToBottom={scrolledToBottomDealers} value={selectedDealer} onChange={setSelectedDealer} onInputChange={v => handleDealerSearch(v)} options={dealerOptions} label='Select Dealer' w={100} isClearable isLoading={dealersLoading} onMenuClose={onCloseDealer} labelStyles={{ fontWeight: 800 }} inputStyles={{ background: 'none', padding: '2px 6px', border: '1px solid #a1a1a1' }} errorStyles={{ background: '#ff000021', border: '1px solid red', color: 'red' }} />
              </div>
            </FormAccordian> */}
            {/* attachments */}
            <FormAccordian count={attachments.length} title='Attachments' style={{ borderRadius: '4px', margin: '8px', background: '#fff' }} bg>
              <div className='d-flex flex-row justify-content-end p-3'>
                <input ref={uploadInputRef} type='file' style={{ display: 'none' }} onChange={addAttachment} />
                <Button variant='contained' size='small' color='primary' startIcon={<AttachFileIcon />} onClick={() => uploadInputRef.current && uploadInputRef.current.click()} className='nf-buttons' disableElevation>
                  Add Attachment
                </Button>
              </div>
              <div className='schedule-triggers tasks justify-content-start align-items-center'>
                {attachments.map(att => (
                  <AttachmentItem url={att.url} key={att.filename} name={att.user_uploaded_name} onDelete={() => deleteAttachment(att)} />
                ))}
                {attachmentUploading && <CircularProgress size={20} thickness={5} />}
              </div>
            </FormAccordian>
          </div>
          <div className={clsx(classes.paneHeader, classes.bottomBar)}>
            <Button variant='contained' color='default' className='nf-buttons' disableElevation onClick={() => closeForm()}>
              Cancel
            </Button>
            <Button variant='contained' color='primary' className='nf-buttons' onClick={validateForm} disableElevation disabled={loading}>
              {loading ? 'Creating Work Order...' : 'Create Work Order'}
              {loading && <CircularProgress size={20} thickness={5} style={{ color: '#fff', marginLeft: '10px' }} />}
            </Button>
          </div>
        </div>
      </Drawer>
      {isAddTaskModalOpen && <AddTaskModal addTasks={setTasks} prevTasks={tasks} open={isAddTaskModalOpen} handleClose={() => setAddTaskModalOpen(false)} />}
      {isAddIssueModalOpen && <AddIssueModal asset={selectedAsset} addTasks={setIssues} prevTasks={issues} open={isAddIssueModalOpen} handleClose={() => setAddIssueModalOpen(false)} />}
    </>
  )
}

export default CreateWorkorder
