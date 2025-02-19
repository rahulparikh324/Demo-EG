import React, { useState, useEffect, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import { FormTitle, TaskItem, FormAccordian, StatusControl, AttachmentItem } from './components'
import TextField from '@material-ui/core/TextField'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import DateFnsUtils from '@date-io/date-fns'
import AddIcon from '@material-ui/icons/Add'
import Button from '@material-ui/core/Button'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import AddTaskModal from './AddTaskModal'
import Checkbox from '@material-ui/core/Checkbox'
import CircularProgress from '@material-ui/core/CircularProgress'
import addUpdatePM from '../../Services/Maintainance/addUpdatePM.service'
import getAllTask from '../../Services/Maintainance/getAllTask.service'
import uploadPMAttachment from '../../Services/Maintainance/uploadPMAttachment'
import getServiceDealers from '../../Services/Maintainance/getServiceDealers'
import _ from 'lodash'
import './maintainance.css'
import clsx from 'clsx'
import AttachFileIcon from '@material-ui/icons/AttachFile'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete'

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

function AddEditPM({ open, onClose, plan, afterSubmit, onEditObject, onDuplicateObject, setToastMsg }) {
  const classes = useStyles()
  const [isAddTaskModalOpen, setAddTaskModalOpen] = useState(false)
  const [pmTitle, setTitle] = useState('')
  const [pmDesc, setDesc] = useState('')
  const [pmStatus, setPMStatus] = useState(1)
  const [scheduleType, setScheduleType] = useState('FIXED')
  const [scheduleBy, setScheduleBy] = useState('TIME')
  const [repeatByTime, setRepByTime] = useState('M')
  const [dueDateFT, setDueDateFT] = useState(new Date())
  const [dueDateRC, setDueDateRC] = useState(new Date())
  const [dueAtMH, setDueAtMH] = useState(0)
  const [tasks, setTasks] = useState([])
  const [errors, setErrors] = useState({})
  const [errorMsgs, setErrorMsgs] = useState({})
  const [repeatsEveryMH, setRepeatsEveryMH] = useState(0)
  const [repeatsEveryTP, setRepeatsEveryTP] = useState(0)
  const [startingAtMH, setStartingAtMH] = useState(0)
  const [triggerAtStarting, setTriggerAtStarting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [taskLoading, setTaskLoading] = useState(false)
  const uploadInputRef = useRef(null)
  const [attachments, setAttachments] = useState([])
  const [attachmentUploading, setAttachmentUploading] = useState(false)
  const [selectedDealer, setSelectedDealer] = useState(null)
  const [dealerOptions, setDealerOptions] = useState([])
  const [pageIndex, setPageIndex] = useState(1)
  const [searchString, setSearchString] = useState('')
  const [dealersLoading, setDealersLoading] = useState(false)
  let typingTimer = null
  //
  const deleteTaskFromList = id => {
    const remainingTasks = tasks.filter(task => task.task_id !== id)
    setTasks(remainingTasks)
  }
  // VALIDATIONS
  const vadlidateForm = () => {
    const error = {}
    const msgs = {}
    const setValues = (key, val, msg) => {
      error[key] = val
      msgs[key] = msg
    }
    _.isEmpty(pmTitle.trim()) && setValues('pm_title', true, 'PM title is required !')
    _.isEmpty(pmDesc.trim()) && setValues('pm_desc', true, 'PM Description is required !')
    if (scheduleType === 'FIXED') {
      ;(scheduleBy === 'TIME' || scheduleBy === 'TM') && JSON.stringify(dueDateFT) === 'null' && setValues('due_at_ft', true, 'Invalid Date !')
      ;(scheduleBy === 'MHRS' || scheduleBy === 'TM') && dueAtMH.toString().length === 0 && setValues('due_at_mh', true, 'Due meters hours required !')
    }
    if (scheduleType === 'RECURRING') {
      scheduleBy === 'TIME' && JSON.stringify(dueDateRC) === 'null' && setValues('due_at_rc', true, 'Invalid Date !')
      ;(scheduleBy === 'TIME' || scheduleBy === 'TM') && repeatsEveryTP.toString().length === 0 && setValues('repeats_every_tp', true, 'Repeat interval required !')
      ;(scheduleBy === 'MHRS' || scheduleBy !== 'TIME') && startingAtMH.toString().length === 0 && setValues('starting_at_mh', true, 'Staring at meters hours required !')
      ;(scheduleBy === 'MHRS' || scheduleBy !== 'TIME') && repeatsEveryMH.toString().length === 0 && setValues('repeats_every_mh', true, 'Repeating meters hours required !')
    }
    _.isEmpty(tasks) && setValues('task_error', true, 'Tasks are required !')
    setErrors(error)
    setErrorMsgs(msgs)
    _.isEmpty(error) && createRequestBody()
  }
  //
  const createRequestBody = async () => {
    const triggerType = TYPE => (TYPE === 'FIXED' ? 24 : 25)
    const triggerBy = TYPE => (TYPE === 'TIME' ? 26 : TYPE === 'MHRS' ? 27 : 28)
    const getRestObj = () => {
      if (scheduleType === 'FIXED') {
        if (scheduleBy === 'TIME') return { datetime_due_at: dueDateFT.toISOString().split('T')[0] }
        if (scheduleBy === 'MHRS') return { meter_hours_due_at: Number(dueAtMH) }
        if (scheduleBy === 'TM') return { meter_hours_due_at: Number(dueAtMH), datetime_due_at: dueDateFT.toISOString().split('T')[0] }
      }
      if (scheduleType === 'RECURRING') {
        if (scheduleBy === 'TIME') return { datetime_starting_at: dueDateRC.toISOString().split('T')[0], datetime_repeates_every: Number(repeatsEveryTP), datetime_repeat_time_period_type: repeatByTime === 'M' ? 29 : 30 }
        if (scheduleBy === 'MHRS') return { meter_hours_starting_at: Number(startingAtMH), meter_hours_repeates_every: Number(repeatsEveryMH) }
        if (scheduleBy === 'TM') return { meter_hours_starting_at: Number(startingAtMH), meter_hours_repeates_every: Number(repeatsEveryMH), datetime_repeates_every: Number(repeatsEveryTP), datetime_repeat_time_period_type: repeatByTime === 'M' ? 29 : 30 }
      }
    }
    const rest = getRestObj()
    const req = {
      title: pmTitle,
      description: pmDesc,
      status: pmStatus,
      pm_plan_id: plan.pm_plan_id,
      pm_trigger_type: triggerType(scheduleType),
      pm_trigger_by: triggerBy(scheduleBy),
      is_trigger_on_starting_at: triggerAtStarting,
      pmTasks: tasks.map(task => ({ task_id: task.task_id })),
      PMAttachments: attachments.map(att => ({ user_uploaded_name: att.user_uploaded_name, filename: att.filename })),
      service_dealer_id: selectedDealer ? selectedDealer.service_dealer_id : null,
      ...rest,
    }
    setLoading(true)
    if (!_.isEmpty(onEditObject)) req.pm_id = onEditObject.pm_id
    // console.log(req)
    submitData(req)
  }
  //
  const submitData = async data => {
    try {
      const res = await addUpdatePM(data)
      if (res.success > 0) setToastMsg.success('PM added successfully !')
      else setToastMsg.error(res.message)
      setTitle('')
      setDesc('')
      setTasks([])
      setAttachments([])
      setLoading(false)
      afterSubmit()
      closeForm()
    } catch (error) {
      setTitle('')
      setLoading(false)
      setDesc('')
      setTasks([])
      setAttachments([])
      setToastMsg.error(error)
      afterSubmit()
      closeForm()
    }
  }
  //
  useEffect(() => {
    const obj = !_.isEmpty(onEditObject) ? onEditObject : onDuplicateObject
    if (!_.isEmpty(obj)) {
      // console.log(obj)
      !_.isEmpty(onEditObject) ? setTitle(obj.title) : setTitle(`Duplicate - ${obj.title}`)
      setDesc(obj.description)
      setPMStatus(obj.status)
      setScheduleType(obj.pm_trigger_type === 24 ? 'FIXED' : 'RECURRING')
      setScheduleBy(obj.pm_trigger_by === 26 ? 'TIME' : obj.pm_trigger_by === 27 ? 'MHRS' : 'TM')
      const offset = new Date().getTimezoneOffset()
      setDueDateFT(new Date(new Date(obj.datetime_due_at).getTime() - offset * 60 * 1000))
      setDueDateRC(new Date(new Date(obj.datetime_starting_at).getTime() - offset * 60 * 1000))
      setDueAtMH(Number(obj.meter_hours_due_at))
      setRepeatsEveryMH(Number(obj.meter_hours_repeates_every))
      setRepeatsEveryTP(obj.datetime_repeates_every)
      setRepByTime(obj.datetime_repeat_time_period_type === 29 ? 'M' : 'Y')
      setStartingAtMH(Number(obj.meter_hours_starting_at))
      setTriggerAtStarting(obj.is_trigger_on_starting_at)
      // console.log(obj.pmAttachments)
      const attachments = obj.pmAttachments.map(att => ({
        url: att.file_url,
        user_uploaded_name: att.user_uploaded_name,
        filename: att.filename,
      }))
      setAttachments(attachments)
      const thisPmTasks = obj.pmTasks.map(q => ({ ...q, ...q.tasks }))
      // console.log(thisPmTasks)
      setTasks(thisPmTasks)
      // ;(async () => {
      //   setTaskLoading(true)
      //   try {
      //     const allTasks = await getAllTask(0, '')
      //     const pmTasks = allTasks.list.filter(task => thisPmTasks.includes(task.task_id))
      //     setTasks(pmTasks)
      //     setTaskLoading(false)
      //   } catch (error) {
      //     setTaskLoading(false)
      //   }
      // })()
      obj.serviceDealers && setSelectedDealer({ ...obj.serviceDealers, name_email: `${obj.serviceDealers.name} - ${obj.serviceDealers.email}` })
    }
  }, [])
  //
  const closeForm = () => {
    setTasks([])
    setAttachments([])
    setTitle('')
    setDesc('')
    setTasks([])
    setErrors({})
    setErrorMsgs({})
    setDueDateFT(new Date())
    setDueDateRC(new Date())
    setSelectedDealer(null)
    onClose(false)
  }
  //attachment
  const addAttachment = e => {
    e.preventDefault()
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
      const res = await uploadPMAttachment(formData)
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
      } else setToastMsg.error(res.message)
    } catch (error) {
      setToastMsg.error(error)
    }
  }
  //vendor
  useEffect(() => {
    ;(async () => {
      setDealersLoading(true)
      try {
        const dealers = await getServiceDealers({ pageIndex: pageIndex, searchString: searchString })
        const _dealers = dealers.data.list.map(d => ({ ...d, name_email: `${d.name} - ${d.email}` }))
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
  //
  const scrolledToBottom = async event => {
    const listboxNode = event.currentTarget
    if (listboxNode.scrollTop + listboxNode.clientHeight === listboxNode.scrollHeight) {
      setPageIndex(prev => prev + 1)
      try {
        const dealers = await getServiceDealers({ pageIndex: pageIndex + 1, searchString: searchString })
        setDealerOptions([...dealerOptions, ...dealers.data.list])
      } catch (error) {
        console.log(error)
        setDealerOptions(dealerOptions)
      }
    }
  }
  //
  const handleSearch = val => {
    clearTimeout(typingTimer)
    typingTimer = setTimeout(async () => {
      setSearchString(val)
      setPageIndex(1)
      searchDealers(val)
    }, 700)
  }
  //
  const searchDealers = async val => {
    setDealersLoading(true)
    try {
      // console.log('search string change', selectedDealer, val)
      const dealers = await getServiceDealers({ pageIndex: 1, searchString: val })
      // console.log(dealers)
      const _dealers = dealers.data.list.map(d => ({ ...d, name_email: `${d.name} - ${d.email}` }))
      setDealerOptions(_dealers)
    } catch (error) {
      console.log(error)
      setDealerOptions([])
    }
    setDealersLoading(false)
  }
  //
  return (
    <>
      <Drawer anchor='right' open={open} onClose={() => closeForm()}>
        <FormTitle title='PM' closeFunc={() => closeForm()} />
        <div className={classes.containerDiv}>
          <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 126px)', height: 'calc(100vh - 126px)', overflowX: 'hidden' }}>
            <div className={classes.containerSubDiv}>
              <TextField value={pmTitle} onChange={e => setTitle(e.target.value)} error={errors.pm_title} helperText={errorMsgs.pm_title} label='PM Title' variant='outlined' placeholder='Add title' className={classes.input} size='small' />
              <TextField value={pmDesc} onChange={e => setDesc(e.target.value)} error={errors.pm_desc} helperText={errorMsgs.pm_desc} label='PM Description' variant='outlined' placeholder='Add description' multiline rows={4} className={classes.input} />
              <FormControl component='fieldset' className={classes.radio}>
                <FormLabel component='legend' className={classes.radioLabel}>
                  PM Status
                </FormLabel>
                <div className='py-2 d-flex flex-row justify-content-between align-items-center'>
                  <RadioGroup row aria-label='position' name='email-report' value={pmStatus} onChange={e => setPMStatus(Number(e.target.value))}>
                    <FormControlLabel value={1} control={<Radio color='primary' />} label='Active' className='radio-label-rep' />
                    <FormControlLabel value={2} control={<Radio color='primary' />} label='Inactive' className='radio-label-rep' />
                  </RadioGroup>
                </div>
              </FormControl>
            </div>
            <FormAccordian title='Schedule Triggers' style={{ borderRadius: '4px', margin: '8px', background: '#fff' }} bg>
              <div className='schedule-triggers'>
                <FormControl variant='outlined' className={classes.formControl}>
                  <InputLabel htmlFor='outlined-age-native-simple'>Schedule type</InputLabel>
                  <Select native value={scheduleType} onChange={e => setScheduleType(e.target.value)} label='Schedule type'>
                    <option value='FIXED'>Fixed One Time</option>
                    <option value='RECURRING'>Recurring</option>
                  </Select>
                </FormControl>
                <FormControl variant='outlined' className={classes.formControl}>
                  <InputLabel htmlFor='outlined-age-native-simple'>Schedule by</InputLabel>
                  <Select native value={scheduleBy} onChange={e => setScheduleBy(e.target.value)} label='Schedule by' size='small'>
                    <option value='TIME'>Time</option>
                    <option value='MHRS'>Meter Hours</option>
                    <option value='TM'>Time / Meter Hours</option>
                  </Select>
                </FormControl>
                {scheduleType === 'FIXED' && scheduleBy !== 'MHRS' && (
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                      disablePast
                      placeholder='MM/DD/YYYY'
                      margin='normal'
                      inputVariant='outlined'
                      label='Due at'
                      format='MM/dd/yyyy'
                      value={dueDateFT}
                      onChange={setDueDateFT}
                      error={errors.due_at_ft}
                      helperText={errorMsgs.due_at_ft}
                      KeyboardButtonProps={{ 'aria-label': 'change date' }}
                      TextFieldComponent={props => <TextField {...props} />}
                      className='date-picker-schedule'
                    />
                  </MuiPickersUtilsProvider>
                )}
                {scheduleType === 'FIXED' && scheduleBy !== 'TIME' && <TextField value={dueAtMH} onChange={e => setDueAtMH(e.target.value)} label='Due at' variant='outlined' placeholder='Enter meter hours' type='number' error={errors.due_at_mh} helperText={errorMsgs.due_at_mh} InputProps={{ inputProps: { min: 0 } }} />}
                {scheduleType === 'RECURRING' && scheduleBy === 'TIME' && (
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                      disablePast
                      placeholder='MM/DD/YYYY'
                      margin='normal'
                      inputVariant='outlined'
                      label='Starting at'
                      format='MM/dd/yyyy'
                      value={dueDateRC}
                      onChange={setDueDateRC}
                      error={errors.due_at_rc}
                      helperText={errorMsgs.due_at_rc}
                      KeyboardButtonProps={{ 'aria-label': 'change date' }}
                      TextFieldComponent={props => <TextField {...props} />}
                      className='date-picker-schedule'
                    />
                  </MuiPickersUtilsProvider>
                )}
                {scheduleType === 'RECURRING' && (scheduleBy === 'TIME' || scheduleBy === 'TM') && (
                  <TextField value={repeatsEveryTP} onChange={e => setRepeatsEveryTP(e.target.value)} error={errors.repeats_every_tp} helperText={errorMsgs.repeats_every_tp} label='Repeats every' variant='outlined' placeholder='Repeats every' type='number' style={{ gridColumn: '1/2' }} InputProps={{ inputProps: { min: 0 } }} />
                )}
                {scheduleType === 'RECURRING' && (scheduleBy === 'TIME' || scheduleBy === 'TM') && (
                  <FormControl variant='outlined' className={classes.formControl}>
                    <InputLabel htmlFor='outlined-age-native-simple'>Time Period</InputLabel>
                    <Select native value={repeatByTime} onChange={e => setRepByTime(e.target.value)} label='Time Period' size='small'>
                      <option value='M'>Months</option>
                      <option value='Y'>Years</option>
                    </Select>
                  </FormControl>
                )}
                {scheduleType === 'RECURRING' && scheduleBy !== 'TIME' && (
                  <TextField
                    label='Starting at'
                    value={startingAtMH}
                    onChange={e => setStartingAtMH(e.target.value)}
                    error={errors.starting_at_mh}
                    helperText={errorMsgs.starting_at_mh}
                    variant='outlined'
                    placeholder='Enter meter hours'
                    type='number'
                    style={scheduleBy === 'TM' ? { gridColumn: '1/2', gridRow: '2/3' } : { gridColumn: '1/2' }}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                )}
                {scheduleType === 'RECURRING' && scheduleBy !== 'TIME' && (
                  <TextField label='Repeats every mHrs' value={repeatsEveryMH} onChange={e => setRepeatsEveryMH(e.target.value)} error={errors.repeats_every_mh} helperText={errorMsgs.repeats_every_mh} variant='outlined' placeholder='Repeats every' type='number' style={{ gridColumn: '1/2' }} InputProps={{ inputProps: { min: 0 } }} />
                )}
                {scheduleBy === 'TM' && scheduleType === 'RECURRING' && <i>OR</i>}
                {scheduleBy === 'TM' && scheduleType === 'FIXED' && <i>* whichever comes first</i>}
                <FormControlLabel control={<Checkbox color='primary' checked={triggerAtStarting} onChange={e => setTriggerAtStarting(e.target.checked)} />} label='Trigger at starting time/meter hours' style={{ gridColumn: '1/3', fontSize: '14px' }} />
              </div>
            </FormAccordian>

            <FormAccordian title='Tasks' error={errors.task_error} style={{ borderRadius: '4px', margin: '8px', background: '#fff' }} bg>
              <div className='d-flex flex-row justify-content-end p-3'>
                <Button variant='contained' size='small' color='primary' startIcon={<AddIcon />} onClick={() => setAddTaskModalOpen(true)} className='nf-buttons' disableElevation>
                  Add Task
                </Button>
              </div>
              <div className='schedule-triggers tasks justify-content-start align-items-center'>
                {errors.task_error && _.isEmpty(tasks) && <div className={classes.taskError}>{errorMsgs.task_error}</div>}
                {taskLoading ? <CircularProgress size={20} thickness={5} /> : tasks.map(task => <TaskItem key={task.task_id} code={task.task_code} title={task.task_title} time={task.task_est_display} onDelete={() => deleteTaskFromList(task.task_id)} />)}
              </div>
            </FormAccordian>
            <FormAccordian title='Attachments' style={{ borderRadius: '4px', margin: '8px', background: '#fff' }} bg>
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
            <FormAccordian title='Service Dealer' style={{ borderRadius: '4px', margin: '8px', background: '#fff' }} bg>
              <div style={{ padding: '12px' }}>
                <Autocomplete
                  classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                  value={selectedDealer}
                  options={dealerOptions}
                  getOptionLabel={option => (option.name_email ? option.name_email : '')}
                  onChange={(e, val) => setSelectedDealer(val)}
                  noOptionsText='No dealers found'
                  renderInput={params => <TextField {...params} onChange={e => handleSearch(e.target.value)} className='filter-input-disable-lastpass' variant='outlined' margin='normal' fullWidth placeholder='Search by Name/Email' />}
                  renderOption={(option, { selected }) => (
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800 }}>{option.name}</div>
                      <div style={{ fontSize: 12, color: '#939393' }}>{option.email}</div>
                    </div>
                  )}
                  ListboxProps={{ onScroll: event => scrolledToBottom(event) }}
                  loading={dealersLoading}
                  loadingText='Loading..'
                />
              </div>
            </FormAccordian>
          </div>
          <div className={clsx(classes.paneHeader, classes.bottomBar)}>
            <Button variant='contained' color='default' className='nf-buttons' disableElevation onClick={() => closeForm()}>
              Cancel
            </Button>
            <Button variant='contained' color='primary' className='nf-buttons' onClick={vadlidateForm} disableElevation disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
              {loading && <CircularProgress size={20} thickness={5} style={{ color: '#fff', marginLeft: '10px' }} />}
            </Button>
          </div>
        </div>
      </Drawer>
      {isAddTaskModalOpen && <AddTaskModal addTasks={setTasks} prevTasks={tasks} open={isAddTaskModalOpen} handleClose={() => setAddTaskModalOpen(false)} />}
    </>
  )
}

export default AddEditPM
