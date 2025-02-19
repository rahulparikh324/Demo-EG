import React, { useState, useEffect } from 'react'
import Box from '@material-ui/core/Box'
import { FormBuilder } from 'react-formio'
import 'formiojs/dist/formio.full.min.css'
import { MinimalInput, MinimalAutoComplete } from '../Assets/components'
import Button from '@material-ui/core/Button'
import _ from 'lodash'
import $ from 'jquery'
import { ErrorDiv } from '../Notification/components'
import { Toast } from '../../Snackbar/useToast'
import addUpdateForm from '../../Services/FormIO/addUpdateForm'
import getAllFormTypes from '../../Services/FormIO/getAllFormTypes'
import './formbuilder.css'
import { history } from '../../helpers/history'
import DraftsIcon from '@material-ui/icons/Drafts'
import PublishIcon from '@material-ui/icons/Publish'
import newFormData from './FormHeaderFooter'

function InspectionForm() {
  const [formData, setFormData] = useState({ display: 'form' })
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [workPro, setWorkPro] = useState('')
  const [formType, setFormType] = useState('')
  const [formTypeOpts, setFormTypeOpts] = useState([])
  const [errors, setErrors] = useState({})
  const [render, setRender] = useState(0)
  const [isEdit, setIsEdit] = useState(false)
  const [pageIndex, setPageIndex] = useState(1)
  const [searchString, setSearchString] = useState('')
  const DRAFT = 74
  const PUBLISH = 1

  const handleFocus = name => {
    const formError = { ...errors }
    delete formError[name]
    setErrors(formError)
  }
  const validateData = status => {
    const formError = {}
    if (_.isEmpty(name)) formError.name = { error: true, msg: 'Name is required !' }
    if (_.isEmpty(workPro)) formError.work = { error: true, msg: 'Work Procedure is required !' }
    if (_.isEmpty(formType)) formError.type = { error: true, msg: 'Form Type is required !' }
    if (_.isEmpty(formData.components.filter(c => c.action !== 'submit'))) formError.formData = { error: true, msg: 'Form cannot be empty !' }
    const submitAction = formData.components.find(c => c.action === 'submit' && c.key === 'submit')
    //if in case no default submit button exist then add manually
    let submitbtn_obj = { type: 'button', label: 'Submit', key: 'submit', size: 'md', block: false, action: 'submit' }
    if (_.isEmpty(submitAction)) {
      formData.components.push(submitbtn_obj)
    }
    // if (_.isEmpty(submitAction)) formError.formData = { error: true, msg: 'Form must have a button with Submit action !' }
    setErrors(formError)
    if (_.isEmpty(formError)) submitData(status)
  }
  const submitData = async status => {
    const dynamic_fields = []
    const dynamic_nameplate_fields = []
    const containerObj = {}
    const sumbissionTemplate = {}
    let containerKey = ''
    let gridKey = ''
    const parseFormData = data => {
      if (data.type === 'container') containerKey = data.key
      if (data.type === 'datagrid') {
        gridKey = data.key
        data.components.forEach(comp => console.log(comp))
      }
      if (data.type === 'columns') data.columns.forEach(comp => parseFormData(comp))
      if (data.type === 'table') data.rows.forEach(row => row.forEach(col => parseFormData(col)))
      if (data.input) {
        if (_.isEmpty(sumbissionTemplate[containerKey])) sumbissionTemplate[containerKey] = {}
        if (containerKey !== data.key) sumbissionTemplate[containerKey][data.key] = ''
      }
      if (_.isEmpty(data.components)) {
        if (data.eg_gridView || data.eg_gridview) {
          dynamic_fields.push({ value: data.label, key: `${containerKey}.${data.key}` })
        }
        if (data.eg_copyfrom || data.eg_copyFrom) {
          dynamic_nameplate_fields.push(data.key)
          const val = _.isEmpty(containerObj[containerKey]) ? [] : containerObj[containerKey]
          val.push(data.key)
          containerObj[containerKey] = val
        }
      } else data.components.forEach(comp => parseFormData(comp))
    }
    parseFormData(formData)
    $('#pageLoading').show()
    console.log(formData, sumbissionTemplate)
    try {
      const payload = {
        form_name: name,
        form_description: desc,
        form_data: JSON.stringify(formData),
        work_procedure: workPro,
        form_type_id: formType.value,
        dynamic_fields,
        dynamic_nameplate_fields: JSON.stringify(containerObj),
        status,
      }
      if (isEdit) payload.form_id = history.location.state.form_id
      const res = await addUpdateForm(payload)
      if (res.success > 0) {
        Toast.success(`Form ${isEdit ? 'saved' : 'created'} successfully !`)
        history.push('../../inspection-forms')
      } else Toast.error(res.message)
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
    }
    $('#pageLoading').hide()
  }
  //
  useEffect(() => {
    if (!_.isEmpty(formData.components)) setErrors({ ...errors, formData: null })
    // const header = document.querySelector('.formio-component-header')
    // const footer = document.querySelector('.formio-component-footer')
    // if (header) header.parentElement.childNodes[1].style.display = 'none'
    // if (footer) footer.parentElement.childNodes[1].style.display = 'none'
  }, [formData, render])
  //------------Data loading-----------
  useEffect(() => {
    ;(async () => {
      try {
        const opts = await getAllFormTypes({ pageIndex, searchString })
        setFormTypeOpts(opts.data.list.map(d => ({ label: d.form_type_name, value: d.form_type_id })))
      } catch (error) {}
    })()
  }, [pageIndex, searchString])
  useEffect(() => {
    if (history.location.state) {
      if (!history.location.state.isCopy) setIsEdit(true)
      const components = JSON.parse(history.location.state.form_data).components
      const footer = components[components.length - 2]
      setDesc(history.location.state.form_description)
      setName(history.location.state.form_name)
      setWorkPro(history.location.state.work_procedure)
      if (history.location.state.form_type) setFormType({ label: history.location.state.form_type, value: history.location.state.form_type_id })
      setFormData(JSON.parse(history.location.state.form_data))
    } else {
      setFormData(newFormData)
    }
  }, [])

  return (
    <div style={{ height: '93vh', padding: ' 0 20px', background: '#fff' }} className='create-inspection-form-builder'>
      <Box className='inspection-title bottom-lines' style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '16px', fontWeight: 800 }}>Create Form</div>
        <span className='bread-crum'>Fill the details to create the form. </span>
      </Box>
      <div className='d-flex'>
        <MinimalInput onFocus={() => handleFocus('name')} error={errors.name} placeholder='Enter Form Name' value={name} onChange={setName} label='Form Name' w={50} />
        <MinimalInput placeholder='Description..' value={desc} onChange={setDesc} label='Description' w={50} />
      </div>
      <div className='d-flex'>
        <MinimalInput onFocus={() => handleFocus('work')} error={errors.work} placeholder='Add Work Procedure..' value={workPro} onChange={setWorkPro} label='Work Procedure' w={50} />
        <MinimalAutoComplete onFocus={() => handleFocus('type')} error={errors.type} placeholder='Select Form Type' value={formType} onChange={v => setFormType(v)} options={formTypeOpts} label='Form Type' w={50} />
      </div>
      <FormBuilder
        form={formData}
        onChange={schema => {
          setRender(p => p + 1)
          setFormData(schema)
        }}
      />
      {errors.formData && <ErrorDiv msg={errors.formData.msg} />}
      <div style={{ marginTop: '24px', paddingBottom: '20px' }} className='d-flex justify-content-between'>
        <div>
          <Button variant='contained' color='default' className='nf-buttons' disableElevation onClick={() => history.push('../../inspection-forms')}>
            Discard
          </Button>
        </div>
        <div>
          <Button startIcon={<DraftsIcon />} variant='contained' color='primary' className='nf-buttons' onClick={() => validateData(DRAFT)} disableElevation style={{ marginRight: '15px' }}>
            Save as Draft
          </Button>
          <Button startIcon={<PublishIcon />} variant='contained' color='primary' className='nf-buttons' onClick={() => validateData(PUBLISH)} disableElevation style={{ marginRight: '15px' }}>
            Publish Form
          </Button>
        </div>
      </div>
    </div>
  )
}

export default InspectionForm
