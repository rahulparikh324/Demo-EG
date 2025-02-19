import React, { useState, useRef } from 'react'

import getFormListToAdd from 'Services/FormIO/get-form-list-to-add'
import getFormListByClass from 'Services/FormIO/get-form-list-by-class'
import addFormInAssetClass from 'Services/FormIO/add-form-in-class'
import getFormJson from 'Services/FormIO/get-form-json'
import assetClass from 'Services/FormIO/asset-class'

import useFetchData from 'hooks/fetch-data'
import { camelizeKeys, snakifyKeys } from 'helpers/formatters'
import { get, isEmpty, orderBy } from 'lodash'
import enums from 'Constants/enums'

import BeenhereIcon from '@material-ui/icons/Beenhere'
import NewReleasesIcon from '@material-ui/icons/NewReleases'
import BuildIcon from '@material-ui/icons/Build'
import SecurityIcon from '@material-ui/icons/Security'
import CircularProgress from '@material-ui/core/CircularProgress'
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined'
import PublishOutlinedIcon from '@material-ui/icons/PublishOutlined'

import { LabelVal } from 'components/common/others'
import { MinimalAutoComplete } from 'components/Assets/components'
import { Toast } from 'Snackbar/useToast'
import { MinimalButton } from 'components/common/buttons'

const AssociatedForms = ({ classId }) => {
  const [isExportLoading, setIsExportLoading] = useState(null)

  const formList = {
    [enums.woType.Acceptance]: { id: enums.woType.Acceptance, type: 'Acceptance', icon: <BeenhereIcon color='primary' fontSize='large' /> },
    [enums.woType.Maintainance]: { id: enums.woType.Maintainance, type: 'Maintenance', icon: <BuildIcon color='primary' fontSize='large' /> },
    [enums.woType.OnBoarding]: { id: enums.woType.OnBoarding, type: 'Onboarding', icon: <NewReleasesIcon color='primary' fontSize='large' /> },
    [enums.woType.Troubleshoot]: { id: enums.woType.Troubleshoot, type: 'Troubleshoot', icon: <SecurityIcon color='primary' fontSize='large' /> },
  }
  const formatList = d => {
    const list = camelizeKeys(get(d, 'data', [])) || []
    const options = list.map(d => ({ ...d, label: d.formName, value: d.formId }))
    return options
  }
  const formatData = d => {
    const list = get(d, 'data', [])
    const obj = {}
    Object.keys(formList).forEach(key => {
      const form = list.find(d => d.woType === Number(key))
      obj[Number(key)] = { ...form, ...formList[form.woType] }
    })
    list.forEach(form => {
      const { type, icon } = formList[form.woType]
      form.type = type
      form.icon = icon
    })
    getForm(obj)
    return obj
  }
  // const { data: nameplateData } = useFetchData({ fetch: assetClass.nameplateInfo.get, payload: { id: classId }, formatter: d => camelizeKeys(get(d, 'data.formNameplateInfo', '{}')), defaultValue: '{}' })
  const { loading, data } = useFetchData({ fetch: getFormListToAdd, payload: { id: classId }, formatter: d => formatList(d) })
  const { loading: dataLoading, data: associatedForms, reFetch } = useFetchData({ fetch: getFormListByClass, payload: { id: classId }, formatter: d => formatData(camelizeKeys(d)) })
  const [form, setForm] = useState(null)
  const [fileName, setFileName] = useState([])

  const [isUploading, setIsUploading] = useState(false)
  const [formnamePlateData, setFormnamePlateData] = useState({
    assetClassId: null,
    pdfReportTemplateUrl: null,
  })
  const uploadRef = useRef(null)

  const handleChange = (val, { id, assetClassFormioMappingId }) => {
    const x = { ...form }
    x[id] = val
    setForm(x)
    submitData({ formId: get(val, 'formId', null), assetClassFormioMappingId })
  }
  const submitData = async data => {
    try {
      const res = await addFormInAssetClass(snakifyKeys(data))
      if (res.success > 0) {
        Toast.success('Class updated successfully !')
      } else Toast.error(res.message)
      reFetch()
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
    }
  }
  const getType = associatedForms => {
    if (!isEmpty(associatedForms[enums.woType.Acceptance].formName)) return associatedForms[enums.woType.Acceptance]
    else if (!isEmpty(associatedForms[enums.woType.Maintainance].formName)) return associatedForms[enums.woType.Maintainance]
    else if (!isEmpty(associatedForms[enums.woType.OnBoarding].formName)) return associatedForms[enums.woType.OnBoarding]
    else return associatedForms[enums.woType.Troubleshoot]
  }
  const parseFormData = (data, nameplateInfo = []) => {
    try {
      nameplateInfo = nameplateInfo || []
      if (['textfield', 'number', 'textarea', 'phoneNumber'].includes(data.type)) nameplateInfo.push({ key: data.key, label: data.label, type: data.type })
      if (data.type === 'select') nameplateInfo.push({ key: data.key, label: data.label, type: data.type, options: get(data, 'data.values', []) })
      if (!isEmpty(data.components)) data.components.forEach(comp => parseFormData(comp, nameplateInfo))
      if (data.type === 'columns') data.columns.forEach(comp => parseFormData(comp, nameplateInfo))
      return nameplateInfo
    } catch (error) {
      return null
    }
  }
  const getForm = async obj => {
    try {
      const type = getType(obj)
      if (type.formName) {
        const res = await getFormJson(snakifyKeys({ formId: type.formId, assetFormId: null }))
        const formData = camelizeKeys(res.data)
        const form = JSON.parse(get(formData, 'assetFormData', '{}'))
        const nameplateComponents = form.components.find(d => d.key === 'nameplateInformation')
        const info = parseFormData(nameplateComponents)
        const npData = await assetClass.nameplateInfo.get({ id: classId })
        const nameplateData = get(npData, 'data.formNameplateInfo', '{}')
        const nameplateObj = {}
        const upd = JSON.parse(nameplateData)
        setFormnamePlateData({
          assetClassId: get(npData, 'data.inspectiontemplateAssetClassId', null),
          pdfReportTemplateUrl: get(npData, 'data.pdfReportTemplateUrl', null),
        })
        setFileName(get(npData, 'data.pdfReportTemplateUrl', null)?.split('/'))
        info.forEach(d => {
          nameplateObj[d.key] = { type: d.type, value: get(upd, [d.key, 'value'], '') }
          if (d.type === 'select') nameplateObj[d.key]['options'] = d.options
        })
        await assetClass.nameplateInfo.update({ inspectiontemplateAssetClassId: classId, formNameplateInfo: JSON.stringify(nameplateObj) })
      } else {
        await assetClass.nameplateInfo.update({ inspectiontemplateAssetClassId: classId, formNameplateInfo: '{}' })
      }
    } catch (error) {
      console.log(error)
      //Toast.error('Nameplate Information could not be saved !')
    }
  }

  //
  const Card = ({ formInfo, style, isMaintenance }) => {
    const cardData = get(associatedForms, [formInfo.id], {})
    //associatedForms.find(d => d.woType === formInfo.id)
    const formData = isEmpty(data) ? null : data.find(d => d.formId === cardData.formId)
    return (
      <div className='p-3 border' style={{ borderRadius: '8px', ...style }}>
        <div className='d-flex align-items-center'>
          {formInfo.icon}
          <div className='ml-2'>
            <div style={{ fontWeight: 800 }}>{formInfo.type}</div>
            <div style={{ fontSize: 12 }}>Workorder Type</div>
          </div>
        </div>
        <div className='mt-2'>
          {!isMaintenance && <MinimalAutoComplete placeholder='Select Form' value={formData} onChange={v => handleChange(v, cardData)} options={data} label='Form' isClearable isLoading={loading} />}
          {/* {isMaintenance && (
            <>
              <MinimalAutoComplete placeholder='Select Form' value={formData} onChange={v => handleChange(v, cardData)} options={data} label='PM' isClearable isLoading={loading} />
              <MinimalAutoComplete placeholder='Select Form' options={data} onChange={v => console.log(v, cardData)} label='Repair' isClearable isLoading={loading} />
              <MinimalAutoComplete placeholder='Select Form' options={data} onChange={v => console.log(v, cardData)} label='Replace' isClearable isLoading={loading} />
              <MinimalAutoComplete placeholder='Select Form' options={data} onChange={v => console.log(v, cardData)} label='Onboarding' isClearable isLoading={loading} />
              <MinimalAutoComplete placeholder='Select Form' options={data} onChange={v => console.log(v, cardData)} label='Trouble Call Check' isClearable isLoading={loading} />
            </>
          )} */}
        </div>
        {!isMaintenance && (
          <>
            <LabelVal label='Name' value={get(cardData, 'formName', '-')} inline />
            <LabelVal label='Type' value={get(cardData, 'formTypeName', '-')} inline />
            <LabelVal label='Work Procedure' value={get(cardData, 'workProcedure', '-')} inline />
          </>
        )}
      </div>
    )
  }

  const handleAssetClass = () => {
    window.open(formnamePlateData.pdfReportTemplateUrl, '_blank')
  }

  const handleUploadTemplate = e => {
    e.preventDefault()
    if (!e.target.files[0]) return
    const reader = new FileReader()
    const file = e.target.files[0]
    reader.onload = d => {
      const extension = file.name.split('.').slice(-1).pop()
      if (!['doc', 'docx'].includes(extension)) {
        Toast.error(enums.errorMessages.error_msg_docx)
        return
      } else {
        uploadTemplate(file)
      }
    }

    reader.readAsDataURL(file)
    e.target.value = null
  }

  const uploadTemplate = async file => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('inspectiontemplate_asset_class_id', formnamePlateData.assetClassId)
    try {
      setIsUploading(true)
      const res = await assetClass.form.upload(formData)
      if (res.success === 1) {
        reFetch()
        Toast.success(enums.resMessages.msg_template)
      } else {
        const msg = isEmpty(res.message) ? enums.errorMessages.error_msg_template : res.message
        Toast.error(msg)
      }
      setIsUploading(false)
    } catch (error) {
      Toast.error(enums.errorMessages.error_msg_template)
      setIsUploading(false)
    }
  }

  return (
    <>
      <input ref={uploadRef} type='file' style={{ display: 'none' }} onChange={handleUploadTemplate} />
      {!(dataLoading || loading) && <div style={{ display: 'flex', alignItems: 'center' }}></div>}
      <div className='p-3 border d-flex align-items-center justify-content-between' style={{ borderRadius: '8px' }}>
        <div className='ml-3'>
          <h4 className='text-bold'>Report Template</h4>
          <div>{fileName?.at(-1) ? fileName?.at(-1) : 'Not Uploaded'}</div>
        </div>
        <div>
          <MinimalButton onClick={() => uploadRef.current && uploadRef.current.click()} text='Upload' size='small' startIcon={<PublishOutlinedIcon fontSize='small' />} variant='contained' color='primary' baseClassName='nf-buttons' style={{ marginLeft: '10px' }} loading={isUploading} disabled={isUploading} loadingText='Uploading...' />
          <MinimalButton
            onClick={handleAssetClass}
            text='Download'
            size='small'
            startIcon={<GetAppOutlinedIcon fontSize='small' />}
            variant='contained'
            color='primary'
            baseClassName='nf-buttons'
            style={{ marginLeft: '5px' }}
            loadingText='Exporting...'
            loading={isExportLoading}
            disabled={isExportLoading || !formnamePlateData.pdfReportTemplateUrl}
          />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr', gap: '28px', marginTop: '16px' }}>
        {dataLoading || loading ? (
          <CircularProgress size={32} thickness={5} style={{ position: 'absolute', top: '50%', left: '50%' }} />
        ) : (
          <>
            <Card formInfo={formList[enums.woType.Acceptance]} />
            <Card formInfo={formList[enums.woType.Maintainance]} />
            {/* <Card formInfo={formList[enums.woType.OnBoarding]} />
          <Card formInfo={formList[enums.woType.Troubleshoot]} /> */}
          </>
        )}
      </div>
    </>
  )
}

export default AssociatedForms
