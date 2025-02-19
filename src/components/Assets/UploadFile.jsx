import React, { useState, useEffect, useCallback } from 'react'
import { DetailedDiv, MinimalAutoComplete } from './components'
import $ from 'jquery'
import getUserRole from '../../helpers/getUserRole'
import companyList from '../../Services/getAllCompany'
import Button from '@material-ui/core/Button'
import _ from 'lodash'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile'
import { useDropzone } from 'react-dropzone'
import { ErrorDiv } from '../Notification/components'
import XLSX from 'xlsx'
import URL from '../../Constants/apiUrls'
import uploadAsset from '../../Services/Asset/uploadAssetService'
import { Toast } from '../../Snackbar/useToast'
import CircularProgress from '@material-ui/core/CircularProgress'
import { Link } from 'react-router-dom'
import * as yup from 'yup'
import { AppendRandomValueToS3Url } from 'components/WorkOrders/onboarding/utils'

function UploadFile() {
  const checkUserRole = new getUserRole()
  const [company, setCompany] = useState('')
  const [companyOptions, setCompanyOptions] = useState([])
  const [error, setError] = useState({})
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(false)
  //
  const onDrop = useCallback(acceptedFiles => {
    acceptedFiles.forEach(file => {
      const extension = file.name.split('.').slice(-1).pop()
      if (['csv', 'xls', 'xlsx', 'xlsm', 'xltx', 'xltm'].includes(extension)) {
        const reader = new FileReader()
        reader.onload = e => {
          const binaryStr = reader.result
          const wb = XLSX.read(binaryStr, { type: 'array', bookVBA: true })
          const wsname = wb.SheetNames[0]
          const ws = wb.Sheets[wsname]
          const data = XLSX.utils.sheet_to_json(ws)
          setData(data)
        }
        reader.readAsArrayBuffer(file)
      }
    })
  }, [])
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({ onDrop })
  const [file, setFile] = useState(acceptedFiles)
  //
  useEffect(() => {
    $('#pageLoading').show()
    const checkUserRole = new getUserRole()
    if (checkUserRole.isCompanyAdmin()) {
      const { default_company_id: company_id, default_company_name: company_name } = JSON.parse(localStorage.getItem('loginData'))
      setCompanyOptions([{ company_id, company_name, label: company_name, value: company_id }])
      setCompany({ company_id, company_name, label: company_name, value: company_id })
      $('#pageLoading').hide()
    }
    if (checkUserRole.isSuperAdmin()) {
      ;(async () => {
        try {
          const allCompaniesList = await companyList()
          const allCompanies = []
          allCompaniesList.data.data.forEach(comp => allCompanies.push({ ...comp, label: comp.company_name, value: comp.company_id }))
          setCompanyOptions(allCompanies)
          setCompany(allCompanies[0])
          $('#pageLoading').hide()
        } catch (error) {
          setCompanyOptions([])
          $('#pageLoading').hide()
        }
      })()
    }
  }, [])
  //
  useEffect(() => {
    const file = acceptedFiles[0]
    setFile(file)
    setError({})
  }, [acceptedFiles])
  //
  const validateFile = () => {
    const ErrorObj = {}
    if (_.isEmpty(file)) {
      ErrorObj['emptyFile'] = true
      ErrorObj['msg'] = 'Please select a File !'
    } else {
      const extension = file.name.split('.').slice(-1).pop()
      if (!['csv', 'xls', 'xlsx', 'xlsm', 'xltx', 'xltm'].includes(extension)) {
        ErrorObj['emptyFile'] = true
        ErrorObj['msg'] = 'Please select a file with proper format/extension !'
      } else {
        if (_.isEmpty(data)) {
          ErrorObj['emptyFile'] = true
          ErrorObj['msg'] = 'No data found in the file while parsing !'
        } else handleFile()
      }
    }
    setError(ErrorObj)
  }
  //
  const removeFile = () => {
    setFile({})
    setError({})
  }
  //
  const handleFile = async () => {
    const handleEmptyString = val => (val ? val.toString() : '')
    const schema = yup.array().of(
      yup.object().shape({
        internal_asset_id: yup.string().required('Internal Asset ID is required !'),
        name: yup.string().required('Asset Name is required !'),
        // asset_type: yup.string().required('Asset Type is required !'),
        // product_name: yup.string().required('Product Name is required !'),
        // model_name: yup.string().required('Model Number is required !'),
        // model_year: yup.string().required('Model Year is required !').matches(/^\d+$/, 'Model Year should contains only numbers !'),
        // asset_serial_number: yup.string().required('Serial No. is required !'),
        // current_stage: yup.string().required('Current Stage is required !'),
        // inspectionform_id: yup.string().required('Inspection Form is required !'),
      })
    )
    const payload = data.map(d => ({
      asset_serial_number: d['Serial number'],
      asset_type: d['Object Type'],
      children: handleEmptyString(d['Children']),
      parent: `${d['Parent']}`,
      current_stage: d['Current stage'],
      inspectionform_id: d['Inspection Form'],
      internal_asset_id: handleEmptyString(d['Object']),
      model_name: d['Model'],
      model_year: handleEmptyString(d['Model year']),
      name: d['Name'],
      product_name: d['Product'],
      site_location: d['Functional location'],
      levels: handleEmptyString(d['Level']),
      condition_index: Number(d['Condition Index']),
      criticality_index: Number(d['Criticality Index']),
      condition_state: Number(d['Condition State']),
    }))

    try {
      // console.log(payload)
      await schema.validate(payload, { abortEarly: false })
      submitData(payload)
    } catch (error) {
      console.log(error.inner[0].path)
      setError({ emptyFile: true, msg: error.inner[0].message })
    }
  }
  //
  const submitData = async data => {
    const requestObj = {
      company_id: company.company_id,
      AssetRequestModel: data,
    }
    //console.log(JSON.stringify(requestObj))
    setLoading(true)
    try {
      const res = await uploadAsset(requestObj)
      // console.log(res)
      if (res.data.success > 0) Toast.success('Asset added successfully !')
      else Toast.error(res.data.message)
    } catch (error) {
      Toast.error('Something went wrong !')
    }
    setLoading(false)
  }
  //
  const downloadSample = () => {
    const link = document.createElement('a')
    link.href = AppendRandomValueToS3Url(URL.sampleXslxProd)
    link.click()
  }
  //
  return (
    <div>
      <DetailedDiv title='Upload  File' addON={{ text: 'Download Sample File', action: () => downloadSample() }} caption='Excel file must have all the values filled in it You can download the sample file from here.'>
        <div className='d-flex'>
          <MinimalAutoComplete isDisabled={checkUserRole.isCompanyAdmin()} value={company} onChange={setCompany} options={companyOptions} label='Company' w={50} />
        </div>
        <div className='d-flex flex-column'>
          <label htmlFor='asset-file-upload' {...getRootProps({ className: `custom-file-upload ${!_.isEmpty(error) && 'error-input'}` })}>
            <svg width='48' height='54' viewBox='0 0 48 54' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M46.4249 48.0126H3.2249C2.3999 48.0126 1.6499 47.2631 1.6499 46.2637V11.3684C1.6499 10.4523 2.3249 9.61949 3.2249 9.61949H24.7499C25.3499 9.61949 25.8749 9.28636 26.0999 8.70339L27.3749 5.87179C27.6749 5.28882 28.1999 4.95569 28.7249 4.95569H46.3499C47.1749 4.95569 47.9249 5.70523 47.9249 6.70462V46.2637C47.9999 47.1798 47.3249 48.0126 46.4249 48.0126Z'
                fill='#62C5E8'
              />
              <path
                d='M45.7499 48.7621H3.2249C2.3999 48.7621 1.6499 48.0126 1.6499 47.0132V12.1179C1.6499 11.2018 2.3249 10.369 3.2249 10.369H24.7499C25.3499 10.369 25.8749 10.0359 26.0999 9.4529L27.3749 6.6213C27.6749 6.03833 28.1999 5.7052 28.7249 5.7052H46.3499C47.1749 5.7052 47.9249 6.45474 47.9249 7.45413V46.2636C47.9999 47.5962 47.0249 48.7621 45.7499 48.7621Z'
                fill='#49A8C3'
              />
              <path d='M0 15.6991V45.5142C0 46.93 0.975 48.0126 2.25 48.0126H45.75C47.025 48.0126 48 46.93 48 45.5142V19.6967C48 18.2809 47.025 17.1982 45.75 17.1982H23.85C23.25 17.1982 22.65 16.9484 22.275 16.4487L20.025 13.9502C19.575 13.4505 19.05 13.2007 18.45 13.2007H2.25C0.975 13.2007 0 14.3666 0 15.6991Z' fill='#70CEEA' />
              <path d='M0 16.4487V46.2637C0 47.6795 0.975 48.7622 2.25 48.7622H45.75C47.025 48.7622 48 47.6795 48 46.2637V20.4462C48 19.0304 47.025 17.9477 45.75 17.9477H23.85C23.25 17.9477 22.65 17.6979 22.275 17.1982L20.025 14.6997C19.575 14.2 19.05 13.9502 18.45 13.9502H2.25C0.975 13.9502 0 15.1161 0 16.4487Z' fill='#62C5E8' />
            </svg>
            <p className='upload-text'>Drag your excel file or document here</p>
            <p className='upload-text'>OR</p>
            <p className='add-ons '>Browse File</p>
            <input {...getInputProps()} />
          </label>
          {!_.isEmpty(file) && (
            <div className={`uploaded-file ${!_.isEmpty(error) && 'error-input'}`}>
              <InsertDriveFileIcon style={{ color: '#1D6A86' }} />
              <div className='fileName'>{file.name}</div>
              <IconButton aria-label='close' size='small' onClick={removeFile}>
                <CloseIcon style={{ color: '#606060' }} />
              </IconButton>
            </div>
          )}
          {!_.isEmpty(error) && <ErrorDiv w={50} msg={error.msg} />}
        </div>
      </DetailedDiv>
      <DetailedDiv>
        <Button variant='contained' color='primary' className='nf-buttons' onClick={validateFile} disabled={loading} disableElevation style={{ marginRight: '15px' }}>
          {loading ? 'Uploading...' : 'Upload Asset'}
          {loading && <CircularProgress size={20} thickness={5} style={{ color: '#fff', marginLeft: '10px' }} />}
        </Button>
        <Button variant='contained' color='default' className='nf-buttons' disableElevation component={Link} to='../../assets'>
          Cancel
        </Button>
      </DetailedDiv>
    </div>
  )
}

export default UploadFile
