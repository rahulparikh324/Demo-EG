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
import { FormAccordian, StatusControl } from '../Maintainance/components'
import uploadWOAttachment from '../../Services/WorkOrder/uploadWOAttachment'
import addUpdateWO from '../../Services/WorkOrder/addUpdateWO'
import { Toast } from '../../Snackbar/useToast'
import AddTaskModal from './AddTaskModal'
import AddIssueModal from './AddIssueModal'
import TimeSpent from './TimeSpent'
import { TaskItem, IssueItem, AttachmentItem, TaskProgress, TaskProgressDetail } from './components'
import AccessTime from '@material-ui/icons/AccessTime'
import HistoryIcon from '@material-ui/icons/History'
import DoneIcon from '@material-ui/icons/Done'
import RefreshIcon from '@material-ui/icons/Refresh'
import { NavigatLinkToNewTab } from '../Requests/components'
import getServiceDealers from '../../Services/Maintainance/getServiceDealers'
import { MinimalDatePicker, MinimalTextArea, MinimalAutoComplete } from '../Assets/components'
import * as yup from 'yup'
import { validateSchema } from '../../helpers/schemaValidation'
import { utils } from 'react-modern-calendar-datepicker'
import { components } from 'react-select'

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
  strong: { fontWeight: 600 },
}))
const styles = {
  paneHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #A6A6A6', padding: '12px' },
  bottomBar: { borderTop: '1px solid #A6A6A6', borderBottom: 'none', background: '#fff', marginTop: 'auto' },
  labelStyle: { fontWeight: 800 },
  inputStyle: { background: 'none', padding: '10px 16px', border: '1px solid #a1a1a1' },
  labelError: { color: 'red', fontWeight: 800 },
  inputError: { background: '#ff000021', padding: '10px 16px', border: '1px solid red', color: 'red', marginBottom: '-5px' },
}

function EditWorkorder({ open, onClose, afterSubmit, editObj }) {
  const classes = useStyles()
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState(45)
  const [errors, setErrors] = useState({})
  const [errorMsgs, setErrorMsgs] = useState({})
  const [loading, setLoading] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [dueDate, setDueDate] = useState(utils().getToday())
  const [compDate, setCompDate] = useState(utils().getToday())
  const [tasks, setTasks] = useState([])
  const [issues, setIssues] = useState([])
  const [woStatus, setWOStatus] = useState(54)
  const uploadInputRef = useRef(null)
  const [attachments, setAttachments] = useState([])
  const [attachmentUploading, setAttachmentUploading] = useState(false)
  const [isAddTaskModalOpen, setAddTaskModalOpen] = useState(false)
  const [isAddIssueModalOpen, setAddIssueModalOpen] = useState(false)
  const [isTSModalOpen, setTSModalOpen] = useState(false)
  const [desc, setDesc] = useState('')
  const [taskTSID, setTaskTSID] = useState('')
  const [totalEstTime, setTotalEstTime] = useState('')
  const [totalSpentTime, setTotalSpentTime] = useState('')
  const [progress, setProgress] = useState(0)
  const [overspent, setOverSpent] = useState(false)
  const [initialRender, setInitialRender] = useState(true)
  const [selectedDealer, setSelectedDealer] = useState(null)
  const [dealerOptions, setDealerOptions] = useState([])
  const [pageIndexForDealer, setPageIndexForDealer] = useState(1)
  const [searchStringForDealer, setSearchStringForDealer] = useState('')
  const [dealersLoading, setDealersLoading] = useState(false)
  let typingTimer = null
  //data loading
  useEffect(() => {
    setTitle(editObj.title)
    setDesc(editObj.description ? editObj.description : '')
    setPriority(editObj.priority)
    const dueD = new Date(editObj.due_at)
    setDueDate({ month: dueD.getMonth() + 1, day: dueD.getDate(), year: dueD.getFullYear() })
    setCompDate({ month: dueD.getMonth() + 1, day: dueD.getDate(), year: dueD.getFullYear() })
    setSelectedAsset(editObj.asset)
    setWOStatus(editObj.status)
    setIssues(editObj.maintenanceRequests)
    const tasks_ = []
    const totEst = { hrs: 0, mins: 0 }
    const totSpd = { hrs: 0, mins: 0 }
    editObj.workOrderTasks.forEach(task => {
      tasks_.push({
        ...task.tasks,
        status: task.status,
        time_spent_hours: task.time_spent_hours,
        time_spent_minutes: task.time_spent_minutes,
      })
      totEst.hrs += task.tasks.task_est_hours
      totEst.mins += task.tasks.task_est_minutes
      totSpd.hrs += task.time_spent_hours
      totSpd.mins += task.time_spent_minutes
    })
    totEst.hrs += Math.floor(totEst.mins / 60)
    totEst.mins %= 60
    totSpd.hrs += Math.floor(totSpd.mins / 60)
    totSpd.mins %= 60
    //console.log(totEst, totSpd)
    if (totSpd.hrs * 60 + totSpd.mins > totEst.hrs * 60 + totEst.mins) {
      setOverSpent(true)
      setProgress(((totEst.hrs * 60 + totEst.mins) / (totSpd.hrs * 60 + totSpd.mins)) * 100)
    } else {
      setOverSpent(false)
      setProgress(((totSpd.hrs * 60 + totSpd.mins) / (totEst.hrs * 60 + totEst.mins)) * 100)
    }
    setTotalEstTime(getTimeSpentAndEst(totEst.hrs, totEst.mins))
    setTotalSpentTime(getTimeSpentAndEst(totSpd.hrs, totSpd.mins))
    //
    const issues_ = []
    editObj.maintenanceRequests.forEach(iss => {
      iss.issue.length && issues_.push({ ...iss.issue[0], inspection_id: iss.inspection_id, meter_at_inspection: iss.meter_at_inspection })
    })
    setAttachments(editObj.workOrderAttachments)
    setIssues(issues_)
    setTasks(tasks_)
    setInitialRender(false)
    editObj.serviceDealers && setSelectedDealer({ ...editObj.serviceDealers, name_email: `${editObj.serviceDealers.name} - ${editObj.serviceDealers.email}`, label: `${editObj.serviceDealers.name} - ${editObj.serviceDealers.email}`, value: editObj.serviceDealers.service_dealer_id })
  }, [])
  //form functions
  const closeForm = () => {
    setTitle('')
    setPriority(45)
    setErrors({})
    setErrorMsgs({})
    setTasks([])
    setIssues([])
    setDesc('')
    //setAttachments([])
    onClose(false)
  }
  const validateForm = async () => {
    const schema = yup.object().shape({
      desc: yup.string().required('Description is required !'),
      tasks: yup.array(),
    })
    const payload = { desc, tasks }
    const isValid = await validateSchema(payload, schema)
    setErrors(isValid)
    if (isValid === true) createRequestBody()
  }
  const onFocus = key => setErrors({ ...errors, [key]: null })
  const createRequestBody = async () => {
    const req = {
      wo_id: editObj.wo_id,
      wo_number: editObj.wo_number,
      title,
      description: desc,
      asset_id: editObj.asset_id,
      priority,
      due_at: getDate(dueDate).split(' ')[0],
      completed_date: getDate(compDate).split(' ')[0],
      wo_type: 59,
      status: woStatus,
      WorkOrderTasks: tasks.map(task => ({
        task_id: task.task_id,
        status: task.status,
        time_spent_hours: task.time_spent_hours,
        time_spent_minutes: task.time_spent_minutes,
        hourly_rate: task.hourly_rate,
      })),
      issue: issues.map(iss => ({ issue_id: iss.issue_uuid, mr_id: iss.mr_id, is_archive: false })),
      workOrderAttachments: attachments.map(att => ({ user_uploaded_name: att.user_uploaded_name, filename: att.filename })),
      service_dealer_id: selectedDealer ? selectedDealer.service_dealer_id : null,
    }
    setLoading(true)
    submitData(req)
  }
  const submitData = async data => {
    try {
      const res = await addUpdateWO(data)
      if (res.success > 0) Toast.success('Work order updated successfully !')
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
    if (_.isEmpty(selectedAsset)) {
      setErrors({ ...errors, asset: true })
      setErrorMsgs({ ...errorMsgs, asset: 'Asset must be selected first to link Issues !' })
    } else {
      setAddIssueModalOpen(true)
    }
  }
  const deleteIssueFromList = id => {
    const remainingTasks = issues.filter(task => task.issue_uuid !== id)
    setIssues(remainingTasks)
  }
  //tasks functions
  useEffect(() => {
    if (!initialRender) {
      const totEst = { hrs: 0, mins: 0 }
      const totSpd = { hrs: 0, mins: 0 }
      tasks.forEach(task => {
        totEst.hrs += task.task_est_hours
        totEst.mins += task.task_est_minutes
        totSpd.hrs += task.time_spent_hours
        totSpd.mins += task.time_spent_minutes
      })
      totEst.hrs += Math.floor(totEst.mins / 60)
      totEst.mins %= 60
      totSpd.hrs += Math.floor(totSpd.mins / 60)
      totSpd.mins %= 60
      if (totSpd.hrs * 60 + totSpd.mins > totEst.hrs * 60 + totEst.mins) {
        setOverSpent(true)
        setProgress(((totEst.hrs * 60 + totEst.mins) / (totSpd.hrs * 60 + totSpd.mins)) * 100)
      } else {
        setOverSpent(false)
        setProgress(((totSpd.hrs * 60 + totSpd.mins) / (totEst.hrs * 60 + totEst.mins)) * 100)
      }
      setTotalEstTime(getTimeSpentAndEst(totEst.hrs, totEst.mins))
      setTotalSpentTime(getTimeSpentAndEst(totSpd.hrs, totSpd.mins))
    }
  }, [tasks])
  const handleAddTaskClick = () => {
    onFocus({ target: { name: 'task_error' } })
    setAddTaskModalOpen(true)
  }
  const deleteTaskFromList = id => {
    const remainingTasks = tasks.filter(task => task.task_id !== id)
    setTasks(remainingTasks)
  }
  const changeTimeSpent = task => {
    setTaskTSID(task)
    setTSModalOpen(true)
  }
  const changeTaskStatus = (id, status) => {
    const tasks_ = [...tasks]
    const changedTask = tasks_.find(task => task.task_id === id)
    changedTask.status = status
    setTasks(tasks_)
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
            file_url: res.data.file_url,
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
  //
  //helpers
  const getDate = date => {
    if (typeof date === 'object') {
      const d = new Date(date.year, date.month - 1, date.day, 12)
      return d.toISOString().split('T')[0]
    } else return new Date(date).toISOString().split('T')[0]
  }
  const getTimeSpentAndEst = (hrs, mins) => {
    if (!hrs && !mins) return
    else if (!hrs) return `${mins} mins`
    else if (!mins) return `${hrs} hrs`
    else return `${hrs} hrs ${mins} mins`
  }
  //vendor
  useEffect(() => {
    ;(async () => {
      setDealersLoading(true)
      try {
        const dealers = await getServiceDealers({ pageIndex: pageIndexForDealer, searchString: searchStringForDealer })
        const _dealers = dealers.data.list.map(d => ({ ...d, name_email: `${d.name} - ${d.email}`, label: `${d.name} - ${d.email}`, value: d.service_dealer_id }))
        setDealerOptions(_dealers)
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
        <FormTitle title={`#${editObj.wo_number} - ${editObj.title}`} closeFunc={() => closeForm()} />
        <div className={classes.containerDiv}>
          <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 126px)', height: 'calc(100vh - 126px)', overflowX: 'hidden' }}>
            {/* form */}
            <div style={{ padding: '16px', background: '#fff', borderRadius: '4px', margin: '10px' }}>
              <div className='py-2 d-flex' style={{ fontSize: '13px' }}>
                <div className={classes.strong}>Created Date : </div>
                <div>{getDate(editObj.created_at)}</div>
              </div>
              <MinimalTextArea onFocus={e => onFocus('desc')} rows={3} value={desc} error={errors.desc} onChange={e => setDesc(e.target.value)} placeholder='Add Description ..' label='Description' w={100} labelStyles={errors.desc ? styles.labelError : styles.labelStyle} InputStyles={errors.desc ? styles.inputError : styles.inputStyle} />
              <PriorityControl value={priority} onChange={setPriority} />
              <MinimalDatePicker date={dueDate} setDate={setDueDate} label='Due at' w={100} labelStyles={styles.labelStyle} InputStyles={styles.inputStyle} />
              {/* <MinimalDatePicker date={compDate} setDate={setCompDate} label='Completed Date' w={100} labelStyles={styles.labelStyle} InputStyles={styles.inputStyle} /> */}
            </div>
            {/* Status*/}
            <div style={{ margin: '8px' }}>
              <div style={{ fontSize: '12px' }}>Update Status</div>
              <div className='py-2 d-flex flex-row justify-content-between align-items-center'>
                <StatusControl title='Open' active={woStatus === 54} onClick={() => setWOStatus(54)} icon={<AccessTime fontSize='small' />} />
                <StatusControl title='Reopened' active={woStatus === 58} onClick={() => setWOStatus(58)} icon={<HistoryIcon fontSize='small' />} />
                <StatusControl title='In Progress' active={woStatus === 55} onClick={() => setWOStatus(55)} icon={<RefreshIcon fontSize='small' />} />
                <StatusControl title='Completed' active={woStatus === 56} onClick={() => setWOStatus(56)} icon={<DoneIcon fontSize='small' />} />
              </div>
            </div>
          </div>
          <div className={clsx(classes.paneHeader, classes.bottomBar)}>
            <Button variant='contained' color='default' className='nf-buttons' disableElevation onClick={() => closeForm()}>
              Cancel
            </Button>
            <Button variant='contained' color='primary' className='nf-buttons' onClick={validateForm} disableElevation disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
              {loading && <CircularProgress size={20} thickness={5} style={{ color: '#fff', marginLeft: '10px' }} />}
            </Button>
          </div>
        </div>
      </Drawer>
      {isAddTaskModalOpen && <AddTaskModal addTasks={setTasks} prevTasks={tasks} open={isAddTaskModalOpen} handleClose={() => setAddTaskModalOpen(false)} />}
      {isAddIssueModalOpen && <AddIssueModal asset={selectedAsset} addTasks={setIssues} prevTasks={issues} open={isAddIssueModalOpen} handleClose={() => setAddIssueModalOpen(false)} />}
      {isTSModalOpen && <TimeSpent taskID={taskTSID} open={isTSModalOpen} tasks={tasks} setTasks={setTasks} handleClose={() => setTSModalOpen(false)} />}
    </>
  )
}

export default EditWorkorder
