import React, { useState, useEffect, useCallback } from 'react'
import { DetailedDiv, MinimalInput, MinimalStatusSelector, MinimalAutoComplete } from './components'
import $ from 'jquery'
import getUserRole from '../../helpers/getUserRole'
import companyList from '../../Services/getAllCompany'
import getAllAssetType from '../../Services/Asset/getAllAssetType'
import addUpdateAsset from '../../Services/Asset/addUpdateAsset'
import getAllInspectionForm from '../../Services/Asset/getAllInspectionForm'
import Button from '@material-ui/core/Button'
import * as yup from 'yup'
import { validateSchema } from '../../helpers/schemaValidation'
import { Toast } from '../../Snackbar/useToast'
import CircularProgress from '@material-ui/core/CircularProgress'
import { Link } from 'react-router-dom'
import { history } from '../../helpers/history'

function UploadAssetDetails() {
  const checkUserRole = new getUserRole()
  const loginData = JSON.parse(localStorage.getItem('loginData'))
  const [internalAssetID, setInternalAssetID] = useState('')
  const [assetName, setAssetName] = useState('')
  const [productName, setProductName] = useState('')
  const [assetType, setAssetType] = useState('')
  const [optionsForAssetType, setOptionsFoAssetType] = useState([])
  const [modelNumber, setModelNumber] = useState('')
  const [serialNo, setSerialNo] = useState('')
  const [modelYear, setModelYear] = useState('')
  const [company, setCompany] = useState('')
  const [companyOptions, setCompanyOptions] = useState([])
  const [site, setSite] = useState('')
  const [siteOptions, setSiteOptions] = useState([])
  const [currentStage, setCurrentStage] = useState('')
  const [status, setStatus] = useState('ACTIVE')
  const [inspectionForm, setInspectionForm] = useState('')
  const [optionsForInspectionForm, setOptionsForInspectionForm] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  //
  useEffect(() => {
    $('#pageLoading').show()
    ;(async () => {
      if (checkUserRole.isCompanyAdmin()) {
        const { default_company_id: company_id, default_company_name: company_name, usersites } = loginData
        fetchAssetTypes(company_id)
        fetchInspectionForms(company_id)
        setCompanyOptions([{ company_id, company_name, label: company_name, value: company_id }])
        setCompany({ company_id, company_name, label: company_name, value: company_id })
        const sites = []
        usersites.forEach(s => s.status !== 20 && sites.push({ ...s, label: s.site_name, value: s.site_id }))
        setSiteOptions(sites)
        setSite(sites[0])
        $('#pageLoading').hide()
      }
      if (checkUserRole.isSuperAdmin()) {
        ;(async () => {
          try {
            const allCompaniesList = await companyList()
            const allCompanies = []
            allCompaniesList.data.data.forEach(comp => allCompanies.push({ ...comp, label: comp.company_name, value: comp.company_id }))
            setCompanyOptions(allCompanies)
            handleCompany(allCompanies[0])
            $('#pageLoading').hide()
          } catch (error) {
            setCompanyOptions([])
            $('#pageLoading').hide()
          }
        })()
      }
    })()
  }, [])

  //* Control handles functions 🚀
  const handleCompany = async company => {
    // console.log(company)
    setSiteOptions(company.sites.map(site => ({ ...site, label: site.site_name, value: site.site_id })))
    setSite({ ...company.sites[0], label: company.sites[0].site_name, value: company.sites[0].site_id })
    setCompany(company)
    $('#pageLoading').show()
    try {
      const ins = await getAllInspectionForm(company.company_id)
      const insForm = []
      ins.data.list.forEach(type => insForm.push({ ...type, value: type.inspection_form_id, label: type.name }))
      setOptionsForInspectionForm(insForm)
      setInspectionForm(insForm[0])
      fetchAssetTypes(company.company_id)
    } catch (error) {
      setOptionsForInspectionForm([])
    }
    $('#pageLoading').hide()
  }
  //* Fetch Asset types
  const fetchAssetTypes = useCallback(async () => {
    try {
      const assetTypes = await getAllAssetType()
      const types = []
      assetTypes.data.list.forEach(type => types.push({ ...type, value: type.asset_type_id, label: type.name }))
      setOptionsFoAssetType(types)
    } catch (error) {
      setOptionsFoAssetType([])
    }
  }, [])
  //* Fetch Inspection form
  const fetchInspectionForms = useCallback(async company_id => {
    try {
      const ins = await getAllInspectionForm(company_id)
      const insForm = []
      ins.data.list.forEach(type => insForm.push({ ...type, value: type.inspection_form_id, label: type.name }))
      setOptionsForInspectionForm(insForm)
      setInspectionForm(insForm[0])
    } catch (error) {
      setOptionsForInspectionForm([])
    }
  }, [])

  const assetTypeScrolledToBottom = () => console.log('assetTypeScrolledToBottom')
  const handleFocus = name => {
    const formError = { ...errors }
    delete formError[name]
    setErrors(formError)
  }
  //! Validation
  const validateForm = async () => {
    const schema = yup.object().shape({
      internal_asset_id: yup.string().required('Internal Asset ID is required !').matches(/^\d+$/, 'Internal Asset ID should contains only numbers !'),
      name: yup.string().required('Asset Name is required !'),
      asset_type: yup.string().required('Asset Type is required !'),
      product_name: yup.string().required('Product Name is required !'),
      model_name: yup.string().required('Model Number is required !'),
      model_year: yup.string().required('Model Year is required !').matches(/^\d+$/, 'Model Year should contains only numbers !'),
      asset_serial_number: yup.string().required('Serial No. is required !'),
      current_stage: yup.string().required('Current Stage is required !'),
      inspectionform_id: yup.string().required('Inspection Form is required !'),
    })
    const payload = {
      internal_asset_id: internalAssetID,
      name: assetName,
      asset_type: assetType.name,
      product_name: productName,
      model_name: modelNumber,
      model_year: modelYear,
      asset_serial_number: serialNo,
      current_stage: currentStage,
      inspectionform_id: inspectionForm.inspection_form_id,
    }
    const isValid = await validateSchema(payload, schema)
    // console.log(isValid)
    setErrors(isValid)
    if (isValid === true) submitData(payload)
  }
  //* Submit Data
  const submitData = async data => {
    const payload = {
      ...data,
      company_id: company.company_id,
      site_id: site.site_id,
      status: status === 'ACTIVE' ? '3' : '4',
      parent: '',
      children: '0',
    }
    // console.log(payload)
    setLoading(true)
    try {
      const res = await addUpdateAsset(payload)
      // console.log(res)
      if (res.success > 0) {
        Toast.success('Asset added successfully !')
        history.goBack()
      } else Toast.error(res.message)
    } catch (error) {
      Toast.error('Something went wrong !')
    }
    setLoading(false)
  }

  return (
    <div>
      <DetailedDiv title='Details' caption='Fill the information regarding the asset'>
        <div className='d-flex'>
          <MinimalInput placeholder='Add internal ID...' onFocus={() => handleFocus('internal_asset_id')} error={errors.internal_asset_id} value={internalAssetID} onChange={setInternalAssetID} label='Internal Asset ID' w={35} />
          <MinimalInput placeholder='Add Asset Name...' onFocus={() => handleFocus('name')} error={errors.name} value={assetName} onChange={setAssetName} label='Asset Name' w={64} />
        </div>
        <div className='d-flex'>
          <MinimalAutoComplete onFocus={() => handleFocus('asset_type')} error={errors.asset_type} placeholder='Select Asset Type' scrollToBottom={assetTypeScrolledToBottom} value={assetType} onChange={setAssetType} options={optionsForAssetType} label='Asset Type' w={49} />
          <MinimalInput placeholder='Add Product Name...' onFocus={() => handleFocus('product_name')} error={errors.product_name} value={productName} onChange={setProductName} label='Product Name' w={50} />
        </div>
        <div className='d-flex'>
          <MinimalInput placeholder='Add Model No...' onFocus={() => handleFocus('model_name')} error={errors.model_name} value={modelNumber} onChange={setModelNumber} label='Model Number' w={35} />
          <MinimalInput placeholder='Add Serial No...' onFocus={() => handleFocus('asset_serial_number')} error={errors.asset_serial_number} value={serialNo} onChange={setSerialNo} label='Asset Serial No.' w={64} />
        </div>
        <div className='d-flex'>
          <MinimalInput placeholder='Add Model Year...' onFocus={() => handleFocus('model_year')} error={errors.model_year} value={modelYear} maxLength={4} onChange={setModelYear} label='Model Year' w={35} />
          <MinimalStatusSelector _default value={status} onChange={setStatus} label='Status' w={35} />
        </div>
      </DetailedDiv>
      <DetailedDiv title='Additional Information' caption='Fill the information regarding the company/site and other details'>
        <div className='d-flex'>
          <MinimalAutoComplete isDisabled={checkUserRole.isCompanyAdmin()} value={company} onChange={handleCompany} options={companyOptions} label='Company' w={49} />
          <MinimalAutoComplete value={site} onChange={setSite} options={siteOptions} label='Site' w={49} />
        </div>
        <div className='d-flex'>
          <MinimalInput placeholder='Add Current Stage...' onFocus={() => handleFocus('current_stage')} error={errors.current_stage} value={currentStage} onChange={setCurrentStage} label='Current Stage' w={35} />
          <MinimalAutoComplete onFocus={() => handleFocus('inspectionform_id')} error={errors.inspectionform_id} value={inspectionForm} onChange={setInspectionForm} options={optionsForInspectionForm} label='Inspection Form' w={49} />
        </div>
      </DetailedDiv>
      <DetailedDiv>
        <Button variant='contained' color='primary' className='nf-buttons' disabled={loading} onClick={validateForm} disableElevation style={{ marginRight: '15px' }}>
          {loading ? 'Adding...' : 'Add Asset'}
          {loading && <CircularProgress size={20} thickness={5} style={{ color: '#fff', marginLeft: '10px' }} />}
        </Button>
        <Button variant='contained' color='default' className='nf-buttons' disableElevation component={Link} to='../../assets'>
          Cancel
        </Button>
      </DetailedDiv>
    </div>
  )
}

export default UploadAssetDetails
