import React, { useState, useEffect, useRef } from 'react'
import Box from '@material-ui/core/Box'
import { history } from '../../helpers/history'
import AddIcon from '@material-ui/icons/Add'
import LinkIcon from '@material-ui/icons/Link'
import AttachFileIcon from '@material-ui/icons/AttachFile'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import _ from 'lodash'
import '../Maintainance/maintainance.css'
import { FormAccordian } from '../Maintainance/components'
import uploadWOAttachment from '../../Services/WorkOrder/uploadWOAttachment'
import getWODetails from '../../Services/WorkOrder/getWODetails.js'
import addUpdateWO from '../../Services/WorkOrder/addUpdateWO'
import { Toast } from '../../Snackbar/useToast'
import AddTaskModal from './AddTaskModal'
import AddIssueModal from './AddIssueModal'
import TimeSpent from './TimeSpent'
import { TaskItem, IssueItem, AttachmentItem, TaskProgress, TaskProgressDetail } from './components'
import { NavigatLinkToNewTab } from '../Requests/components'
import getServiceDealers from '../../Services/Maintainance/getServiceDealers'
import * as yup from 'yup'
import { validateSchema } from '../../helpers/schemaValidation'
import { utils } from 'react-modern-calendar-datepicker'
import { components } from 'react-select'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import Checkbox from '@material-ui/core/Checkbox'
import EditWorkorder from './EditWorkorder'
import StatusHistory from './StatusHistory'
import $ from 'jquery'

function WorkOrderDetail({ workOrderID }) {
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
  const [isOverride, setOverride] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [isEditOpen, setEditOpen] = useState(false)
  const [isHistoryOpen, setHistoryOpen] = useState(false)
  const [reload, setReload] = useState(0)
  const [editInfo, setEditInfo] = useState({})
  const [editObj, setEditObj] = useState({})
  const [isCompleteWOEnable, setIsCompleteWOEnable] = useState(false)
  let typingTimer = null
  //const editObj = history.location.state
  //
  useEffect(() => {
    ;(async () => {
      $('#pageLoading').show()
      try {
        const details = await getWODetails(workOrderID)
        // const editObj = details.data
        // console.log(editObj)
        // console.log('loaded', initialRender)
        setEditInfo(editObj)
        setEditObj(editObj)
        setDesc(editObj.description ? editObj.description : '')
        setTitle(editObj.title)
        setPriority(editObj.priority)
        setWOStatus(editObj.status)
        const dueD = new Date(editObj.due_at)
        setDueDate({ month: dueD.getMonth() + 1, day: dueD.getDate(), year: dueD.getFullYear() })
        setCompDate({ month: dueD.getMonth() + 1, day: dueD.getDate(), year: dueD.getFullYear() })
        setSelectedAsset(editObj.asset)
        const tasks_ = []
        const totEst = { hrs: 0, mins: 0 }
        const totSpd = { hrs: 0, mins: 0 }
        const tastStatusArr = []
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
          tastStatusArr.push(task.status)
        })
        totEst.hrs += Math.floor(totEst.mins / 60)
        totEst.mins %= 60
        totSpd.hrs += Math.floor(totSpd.mins / 60)
        totSpd.mins %= 60
        if ([...new Set(tastStatusArr)].length === 1 && [...new Set(tastStatusArr)][0] === 15) {
          // console.log('all task completed')
          setIsCompleteWOEnable(true)
        } else setIsCompleteWOEnable(false)
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
          iss.issue.length && issues_.push({ ...iss.issue[0], meter_at_inspection: iss.meter_at_inspection })
        })
        setAttachments(editObj.workOrderAttachments)
        setIssues(issues_)
        setTasks(tasks_)
        setInitialRender(false)
        editObj.serviceDealers && setSelectedDealer({ ...editObj.serviceDealers, name_email: `${editObj.serviceDealers.name} - ${editObj.serviceDealers.email}`, label: `${editObj.serviceDealers.name} - ${editObj.serviceDealers.email}`, value: editObj.serviceDealers.service_dealer_id })
      } catch (error) {}
      $('#pageLoading').hide()
    })()
  }, [reload])
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
      asset_id: selectedAsset.asset_id,
      priority,
      due_at: _getDate(dueDate),
      completed_date: _getDate(compDate),
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
    submitData(req)
  }
  const submitData = async data => {
    $('#pageLoading').show()
    try {
      const res = await addUpdateWO(data)
      if (res.success > 0) Toast.success('Work order updated successfully !')
      else Toast.error(res.message)
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
    }
    $('#pageLoading').hide()
    setLoading(false)
    setInitialRender(true)
    setReload(p => p + 1)
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
  useEffect(() => {
    // console.log('change in issues ', initialRender)
    if (!initialRender) validateForm()
  }, [issues])
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
      // console.log('change in issues', initialRender)
      validateForm()
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
  useEffect(() => {
    // console.log('change in att', initialRender)
    if (!initialRender) validateForm()
  }, [attachments])
  //
  //helpers
  const _getDate = date => {
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
  const LabelVal = ({ label, value }) => (
    <div className='py-2 d-flex'>
      <div style={{ fontWeight: 800 }}>{label}:</div>
      <div className='ml-1'>{value}</div>
    </div>
  )
  //
  const getWorkOrderStatus = status => {
    const getColor = () => {
      if (status === 54) return '#ffba00'
      if (status === 55) return '#FF5C00'
      if (status === 56) return '#00B407'
      if (status === 57) return '#8F8F8F'
      if (status === 58) return '#D9B51C'
    }
    const getLabel = () => {
      if (status === 54) return 'Open'
      if (status === 55) return 'In Progress'
      if (status === 56) return 'Completed'
      if (status === 57) return 'Cancelled'
      if (status === 58) return 'Reopened'
    }
    return <span style={{ padding: '2px 12px', fontSize: '12px', fontWeight: 800, borderRadius: '8px', color: 'white', background: getColor() }}>{getLabel()}</span>
  }
  const getPriority = pr => {
    const getColor = () => {
      if (pr === 45) return '#519839'
      if (pr === 46) return '#d9b51c'
      if (pr === 47) return '#cd8313'
    }
    const getLabel = () => {
      if (pr === 45) return 'Low'
      if (pr === 46) return 'Medium'
      if (pr === 47) return 'High'
    }
    return <span style={{ padding: '2px 12px', fontSize: '12px', fontWeight: 800, borderRadius: '8px', color: 'white', background: getColor() }}>{getLabel()}</span>
  }
  const completeWO = () => {
    setWOStatus(56)
    setLoading(true)
  }
  useEffect(() => {
    console.log('change in status')
    if (!initialRender) validateForm()
  }, [woStatus])
  const afterSubmit = () => {
    setReload(p => p + 1)
    setInitialRender(true)
  }
  const checkCompWOEnableStatus = () => {
    if (isOverride || isCompleteWOEnable) return false
    else if (loading) return true
    else return true
  }

  return (
    <div style={{ padding: '0 20px 20px 20px', background: '#fff' }}>
      <Box className='inspection-title bottom-lines d-flex justify-content-between'>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 800 }}>Workorder Details</div>
          <Box className='inspection-breadcrum'>
            <ul className='bread-crum'>
              <li>
                <button onClick={() => history.goBack()} style={{ border: 'none', padding: 0, outline: 'none', background: 'transparent' }}>
                  Workorder
                </button>
              </li>
              <li> {'>'} </li>
              <li>{editObj.wo_id}</li>
            </ul>
          </Box>
        </div>
      </Box>
      <div style={{ padding: '20px 0', position: 'relative' }}>
        <div style={{ padding: '16px', background: '#fafafa', borderRadius: '4px' }}>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
              <LabelVal label='WO #' value={`${editObj.wo_number}`} />
              <LabelVal label='Status' value={getWorkOrderStatus(woStatus)} />
              {editObj.created_at && <LabelVal label='Created Date' value={editObj.created_at.split('T')[0]} />}
              <div style={{ justifyItems: 'flex-end', display: 'inherit' }}>
                <IconButton aria-label='more' aria-controls='long-menu' aria-haspopup='true' onClick={e => setAnchorEl(e.currentTarget)} size='small'>
                  <MoreVertIcon fontSize='small' />
                </IconButton>
                <Menu id='schedule-list-menu' anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                  {[54, 55, 58].includes(editObj.status) && (
                    <MenuItem
                      onClick={() => {
                        setEditOpen(true)
                        setAnchorEl(null)
                      }}
                    >
                      Edit
                    </MenuItem>
                  )}
                  <MenuItem
                    onClick={() => {
                      setHistoryOpen(true)
                      setAnchorEl(null)
                    }}
                  >
                    History
                  </MenuItem>
                </Menu>
              </div>
              <LabelVal label='Due at' value={_getDate(dueDate)} />
              <LabelVal label='Work Type' value={editObj.wo_type_name} />
              <LabelVal label='Priority' value={getPriority(priority)} />
            </div>
            <div>
              <div style={{ fontWeight: 800 }}>Description</div>
              <div>{desc}</div>
            </div>
          </div>
          <NavigatLinkToNewTab style={{ margin: 0 }} title='Asset Info' func={() => window.open(`../../assets/details/${editObj.asset.asset_id}`, '_blank')}>
            {editObj.asset && (
              <i>
                <strong style={{ color: '#146481' }}>#{editObj.asset.internal_asset_id}</strong> - {editObj.asset.name} --- Current Meter Hours: <strong style={{ color: '#146481' }}>{editObj.asset.meter_hours}</strong>
              </i>
            )}
          </NavigatLinkToNewTab>
          {/* tasks */}
          <FormAccordian keepOpen extra={<TaskProgressDetail totalEstTime={totalEstTime} totalSpentTime={totalSpentTime} />} progress={<TaskProgress overspent={overspent} val={progress} />} count={tasks.length} title='Tasks' error={errors.task_error} style={{ borderRadius: '4px', margin: '0 0 8px 0', background: '#fff' }} bg>
            {[54, 55, 58].includes(editObj.status) && (
              <div className='d-flex flex-row justify-content-end p-3'>
                <Button variant='contained' size='small' color='primary' startIcon={<AddIcon />} name='task_error' onClick={handleAddTaskClick} className='nf-buttons' disableElevation>
                  Add Task
                </Button>
              </div>
            )}
            <div className='schedule-triggers tasks justify-content-start align-items-center' style={{ gap: '0', width: '100%' }}>
              {errors.task_error && _.isEmpty(tasks) && <div style={{ color: 'red', textAlign: 'center' }}>{errorMsgs.task_error}</div>}
              {tasks.map(task => (
                <TaskItem
                  isViewEdit
                  task={task}
                  key={task.task_id}
                  id={task.task_id}
                  changeTaskStatus={changeTaskStatus}
                  code={`#${task.task_code}`}
                  status={task.status}
                  title={task.task_title}
                  time={task.task_est_display}
                  onTimeSpent={() => changeTimeSpent(task)}
                  onDelete={() => deleteTaskFromList(task.task_id)}
                  readOnly={task.status === 15}
                  noDelete={task.status === 15}
                />
              ))}
            </div>
          </FormAccordian>
          {/* issues */}
          <FormAccordian count={issues.length} title='Issues' style={{ borderRadius: '4px', margin: '0 0 8px 0', background: '#fff' }} bg>
            {[54, 55, 58].includes(editObj.status) && (
              <div className='d-flex flex-row justify-content-end p-3'>
                <Button variant='contained' size='small' color='primary' startIcon={<LinkIcon />} onClick={handleAddIssueClick} className='nf-buttons' disableElevation>
                  Link Issue
                </Button>
              </div>
            )}
            <div className='schedule-triggers tasks justify-content-start align-items-center' style={{ gap: '0', width: '100%' }}>
              {issues.map(issue => (
                <IssueItem noDelete={editObj.status === 56} key={issue.issue_uuid} inspectionID={issue.inspection_id} meters={issue.meter_at_inspection} code={`#${issue.issue_number}`} title={issue.name} status={issue.status} onDelete={() => deleteIssueFromList(issue.issue_uuid)} />
              ))}
            </div>
          </FormAccordian>
          {/* attachments */}
          <FormAccordian count={attachments.length} title='Attachments' style={{ borderRadius: '4px', margin: '0 0 8px 0', background: '#fff' }} bg>
            {[54, 55, 58].includes(editObj.status) && (
              <div className='d-flex flex-row justify-content-end p-3'>
                <input ref={uploadInputRef} type='file' style={{ display: 'none' }} onChange={addAttachment} />
                <Button variant='contained' size='small' color='primary' startIcon={<AttachFileIcon />} onClick={() => uploadInputRef.current && uploadInputRef.current.click()} className='nf-buttons' disableElevation>
                  Add Attachment
                </Button>
              </div>
            )}
            <div className='schedule-triggers tasks justify-content-start align-items-center' style={{ gap: '0', width: '100%' }}>
              {attachments.map(att => (
                <AttachmentItem noDelete={editObj.status === 56} url={att.file_url} key={att.filename} name={att.user_uploaded_name} onDelete={() => deleteAttachment(att)} />
              ))}
              {attachmentUploading && <CircularProgress size={20} thickness={5} />}
            </div>
          </FormAccordian>
        </div>
      </div>
      {[54, 55, 58].includes(editObj.status) && (
        <div className='d-flex row-reverse justify-content-end'>
          <div className='d-flex align-items-center'>
            <div style={{ fontWeight: 800, marginRight: '5px' }}>Override</div>
            <Checkbox checked={isOverride} onChange={e => setOverride(e.target.checked)} name='checkedB' color='primary' size='small' style={{ padding: '2px' }} />
          </div>
          <Button variant='contained' color='primary' className='nf-buttons mx-2' onClick={completeWO} disableElevation disabled={checkCompWOEnableStatus()}>
            {loading ? 'Completing...' : 'Complete Workorder'}
            {loading && <CircularProgress size={20} thickness={5} style={{ color: '#fff', marginLeft: '10px' }} />}
          </Button>
        </div>
      )}
      {isAddTaskModalOpen && <AddTaskModal addTasks={setTasks} prevTasks={tasks} open={isAddTaskModalOpen} handleClose={() => setAddTaskModalOpen(false)} />}
      {isAddIssueModalOpen && <AddIssueModal asset={selectedAsset} addTasks={setIssues} prevTasks={issues} open={isAddIssueModalOpen} handleClose={() => setAddIssueModalOpen(false)} />}
      {isTSModalOpen && <TimeSpent taskID={taskTSID} open={isTSModalOpen} tasks={tasks} setTasks={setTasks} handleClose={() => setTSModalOpen(false)} />}
      {isEditOpen && <EditWorkorder editObj={editInfo} open={isEditOpen} onClose={() => setEditOpen(false)} afterSubmit={afterSubmit} />}
      {isHistoryOpen && <StatusHistory historyObj={editObj} open={isHistoryOpen} onClose={() => setHistoryOpen(false)} />}
    </div>
  )
}

export default WorkOrderDetail
