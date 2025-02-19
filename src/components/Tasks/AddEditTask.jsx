import React, { useState, useEffect } from 'react'
import Drawer from '@material-ui/core/Drawer'
import { FormTitle } from '../Maintainance/components'
import { MinimalInput, MinimalTextArea, MinimalAutoComplete } from '../Assets/components'
import _ from 'lodash'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import * as yup from 'yup'
import { validateSchema } from '../../helpers/schemaValidation'
import addUpdateTask from '../../Services/Maintainance/addUpdateTask.service'
import { Toast } from '../../Snackbar/useToast'
import getAllFormNames from '../../Services/FormIO/getAllFormNames.js'

const styles = {
  paneHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #A6A6A6', padding: '12px' },
  bottomBar: { borderTop: '1px solid #A6A6A6', borderBottom: 'none', background: '#fff', marginTop: 'auto' },
  labelStyle: { fontWeight: 800 },
  inputStyle: { background: 'none', padding: '10px 16px', border: '1px solid #a1a1a1' },
}

function AddEditTask({ open, onClose, afterSubmit, obj }) {
  const [error, setError] = useState({})
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [hours, setHours] = useState(0)
  const [mins, setMins] = useState(0)
  const [rate, setRate] = useState(0)
  const [desc, setDesc] = useState('')
  const [notes, setNotes] = useState('')
  const [pageIndexF, setPageIndexF] = useState(1)
  const [selectedAsset, setSelectedAsset] = useState([])
  const [selectedForm, setSelectedForm] = useState('')
  const [FormOptions, setFormOptions] = useState([])
  const [FormsLoading, setFormsLoading] = useState(false)
  let typingTimer = null
  // load
  useEffect(() => {
    ;(async () => {
      setFormsLoading(true)
      try {
        const formList = await getAllFormNames(pageIndexF)
        setFormOptions(formList.data.list.map(asset => ({ label: asset.form_name, value: asset.form_id })))
      } catch (error) {
        setFormOptions([])
      }
      setFormsLoading(false)
    })()
    if (!_.isEmpty(obj)) {
      setTitle(obj.task_title)
      setDesc(obj.description)
      setNotes(obj.notes)
      setSelectedForm({ label: obj.form_name, value: obj.form_id })
    }
  }, [])
  // Validation
  const validateForm = async () => {
    const schema = yup.object().shape({
      task_title: yup.string().required('Title is required !').max(100, 'Title can not be more than 100 characters !'),
      // task_est_minutes: yup.number().required('Minutes is required !').max(59, 'Minutes can not be more than 59 !'),
      // task_est_hours: yup.number().required('Hours is required !'),
      // hourly_rate: yup.number().required('Hourly Rate is required !').min(1, 'Hourly Rate cannot be Zero !'),
      desc: yup.string().required('Description is required !'),
      form_id: yup.string().required('Form is required !'),
      // asset: yup.string().required('Assets are required !'),
    })
    const payload = {
      task_title: title,
      task_est_minutes: Number(mins),
      task_est_hours: Number(hours),
      hourly_rate: Number(rate),
      desc,
      form_id: selectedForm ? selectedForm.value : '',
      asset: selectedAsset.asset_id,
    }
    const isValid = await validateSchema(payload, schema)
    //console.log(payload, isValid)
    setError(isValid)
    if (isValid === true) submitData(payload)
  }
  // Submit
  const submitData = async data => {
    setLoading(true)
    try {
      const { task_title, task_est_minutes, task_est_hours, hourly_rate, desc, form_id } = data
      const pay = {
        task_title,
        //task_est_minutes,
        //task_est_hours,
        //hourly_rate,
        description: desc,
        form_id,
        notes,
        //AssetTasks: [{ asset_id: data.asset }],
      }
      const payload = !_.isEmpty(obj) ? { ...pay, task_id: obj.task_id } : pay
      //console.log(payload)
      const res = await addUpdateTask(payload)
      if (res.success > 0) Toast.success(_.isEmpty(obj) ? 'New Task created successfully !' : 'Task Updated successfully !')
      else Toast.error(res.message)
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
    }
    setLoading(false)
    onClose()
    afterSubmit()
  }
  //
  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title={!_.isEmpty(obj) ? 'Edit Task' : 'Create Task'} closeFunc={onClose} />
      <div style={{ padding: '10px', height: '100%', background: '#efefef', width: '450px' }}>
        <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
          <MinimalInput value={title} onChange={setTitle} error={error.task_title} label='Title' placeholder='Add Title' w={100} labelStyles={styles.labelStyle} InputStyles={styles.inputStyle} onFocus={() => setError({ ...error, task_title: null })} />
          <MinimalTextArea onFocus={e => setError({ ...error, desc: null })} rows={3} value={desc} error={error.desc} onChange={e => setDesc(e.target.value)} placeholder='Add Description ..' label='Description' w={100} />
          <MinimalAutoComplete
            onFocus={e => setError({ ...error, form_id: null })}
            placeholder='Select Form'
            value={selectedForm}
            onChange={setSelectedForm}
            options={FormOptions}
            label='Select Form'
            w={100}
            isClearable
            isLoading={FormsLoading}
            labelStyles={{ fontWeight: 800 }}
            inputStyles={{ background: 'none', padding: '2px 6px', border: '1px solid #a1a1a1' }}
            errorStyles={{ background: '#ff000021', border: '1px solid red', color: 'red' }}
            error={error.form_id}
          />
          <MinimalTextArea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder='Add Notes ..' label='Notes' w={100} />
        </div>
      </div>
      <div style={{ ...styles.paneHeader, ...styles.bottomBar }}>
        <Button variant='contained' color='default' className='nf-buttons' disableElevation onClick={onClose}>
          Cancel
        </Button>
        <Button variant='contained' color='primary' className='nf-buttons' onClick={validateForm} disableElevation disabled={loading}>
          {loading ? (!_.isEmpty(obj) ? 'Saving...' : 'Creating...') : !_.isEmpty(obj) ? 'Save' : 'Create Task'}
          {loading && <CircularProgress size={20} thickness={5} style={{ color: '#fff', marginLeft: '10px' }} />}
        </Button>
      </div>
    </Drawer>
  )
}

export default AddEditTask
