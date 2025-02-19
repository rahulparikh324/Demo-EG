import React, { useState, useEffect, useContext } from 'react'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Button from '@material-ui/core/Button'
import { MinimalDatePicker, MinimalTextArea, MinimalAutoComplete, MinimalStatusSelector, MinimalInput, CustomAutoCompleteWithAdd } from '../Assets/components'
import * as yup from 'yup'
import { validateSchema } from '../../helpers/schemaValidation'
import { utils } from 'react-modern-calendar-datepicker'
import { Toast } from '../../Snackbar/useToast'
import CircularProgress from '@material-ui/core/CircularProgress'
import createAcceptanceWO from '../../Services/WorkOrder/createAcceptanceWO'
import { history } from '../../helpers/history'
import enums from '../../Constants/enums'
import { workOrderTypesPath, photoTypeOptions, reminderOptions } from './utils'
import useFetchData from 'hooks/fetch-data'
import { get, isEmpty, orderBy, filter, set } from 'lodash'
import Drawer from '@material-ui/core/Drawer'
import { FormTitle } from 'components/Maintainance/components'
import { getApplicationStorageItem } from 'helpers/getStorageItem'
import { quoteTypesPath } from 'components/quotes/utils'
import onBoardingWorkorder from 'Services/WorkOrder/on-boarding-wo'
import getAllTechnicianList from 'Services/User/getAllTechnicianList'
import getBackOfficeUserList from 'Services/User/getBackofficeUserList'
import Dialog from '@material-ui/core/Dialog'
import { FloatingButton, MinimalButton } from 'components/common/buttons'
import { FormSection } from 'components/common/others'
import DialogPrompt from 'components/DialogPrompt'
import { useTheme } from '@material-ui/core'
import RemoveIcon from '@material-ui/icons/Remove'
import jobScheduler from 'Services/jobScheduler'
import { MainContext } from 'components/Main/provider'
import moment from 'moment'
import { formattedTimeLocalToUTC } from 'helpers/getDateTime'

function CreateAccWO({ open, handleClose, type, noReDirect, reFetch, isQuotes = false }) {
  const loginData = JSON.parse(localStorage.getItem('loginData'))
  const siteName = getApplicationStorageItem('siteName')
  const { loginSiteData } = useContext(MainContext)
  const [enterprise, setEnterprise] = useState(null)
  const [enterpriseOpts, setEnterpriseOpts] = useState([])
  const [site, setSite] = useState(null)
  const [siteOpts, setSiteOpts] = useState([])
  const [startDate, setStartDate] = useState({ ...utils().getToday(), time: '12:00' })
  const [dueDate, setDueDate] = useState({ ...utils().getToday(), time: '12:00' })
  const [desc, setDesc] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [isPlanned, setIsPlanned] = useState(isQuotes ? 'PLANNED' : 'RELEASED OPEN')
  const [manualWoNumber, setManualWoNumber] = useState('')
  const [technicianOpts, setTechnicianOpts] = useState([])
  const [nonTechnicianOpts, setNonTechnicianOpts] = useState([])
  const [responsibleParty, setResponsibleParty] = useState([])
  const [technician, setTechnician] = useState([])
  const [PONumber, setPONumber] = useState('')
  const [lead, setLead] = useState([])
  const [leadOptions, setLeadOptions] = useState([])
  const [nonLeadOptions, setNonLeadOptions] = useState([])
  const [isOpenEmailDrawer, setOpenEmailDrawer] = useState(false)
  const [cameraType, setCameraType] = useState('FLIR')
  const [photoType, setPhotoType] = useState(null)
  const [isReminder, setReminder] = useState('NO')
  const [vendorList, setVendorList] = useState([])
  const [isDeleteVendorOpen, setDeleteVendorOpen] = useState([false, 0])
  const [reminderList, setReminderList] = useState([])
  const [vendorOptions, setVendorOptions] = useState([])
  const [vendorAllOptions, setVendorAllOptions] = useState([])

  const getSiteOpts = () => {
    const { usersites, client_company } = loginData
    const sites = []
    usersites.forEach(s => {
      const clientCompanyName = client_company.filter(d => d.client_company_id.includes(s.client_company_id))
      if (s.status !== 20) {
        sites.push({ ...s, label: `${clientCompanyName[0]?.client_company_name} -> ${s.site_name}`, value: s.site_id })
      }
    })
    const alphabeticalSites = orderBy(sites, [s => s.label.toLowerCase()], ['asc'])
    return alphabeticalSites
  }

  const [facilityOpts, setFacilityOpts] = useState(getSiteOpts())
  const [facility, setFacility] = useState(getSiteOpts().find(d => d.site_id === get(loginSiteData, 'activeSiteId', null)))

  const theme = useTheme()

  const { data, loading: technicianDropdownLoading } = useFetchData({ fetch: getAllTechnicianList, payload: { siteId: facility?.site_id }, formatter: d => handleFormatter(get(d, 'list', [])), condition: !isQuotes && facility !== null })
  useFetchData({ fetch: jobScheduler.getDropdown, formatter: d => handleVendorFormatter(get(d, 'data.workorderVendorContactsList', [])) })

  const handleVendorFormatter = vendor => {
    const options = vendor.map(d => ({
      ...d,
      label: `${d.vendorName} <${d.vendorEmail}>`,
      value: d.vendorId,
    }))
    setVendorOptions(options)
    setVendorAllOptions(options)
  }

  const handleLeadFormatter = lead => {
    const newList = orderBy(lead, [d => d.firstname && d.firstname.toLowerCase()], 'asc')
    const currSiteUsers = newList.filter(d => d.is_curr_site_user).map(d => ({ ...d, label: `${d.firstname} ${d.lastname}`, value: d.uuid }))
    const nonSiteUsers = newList.filter(d => !d.is_curr_site_user).map(d => ({ ...d, label: `${d.firstname} ${d.lastname}`, value: d.uuid }))

    setLeadOptions(currSiteUsers)
    setNonLeadOptions(nonSiteUsers)
  }

  const { loading: backOfficeLoading } = useFetchData({ fetch: getBackOfficeUserList, payload: { siteId: facility?.site_id }, formatter: d => handleLeadFormatter(get(d, 'list', [])), condition: facility !== null })

  const handleFormatter = technicianList => {
    const technician = orderBy(technicianList, [d => d.firstname && d.firstname.toLowerCase()], 'asc')
    return technician
  }

  // responsible party
  const { data: responsiblePartyOptions } = useFetchData({ fetch: onBoardingWorkorder.responsibleParty, formatter: d => handleResponsivePartyFormatter(get(d, 'data.list', [])) })

  const handleResponsivePartyFormatter = data => {
    const options = data.map(d => ({ label: d.responsiblePartyName, value: d.responsiblePartyId }))
    return options
  }
  //
  useEffect(() => {
    const comp = getApplicationStorageItem('clientCompanyName')
    const compOpts = loginData.client_company.map(cmp => ({ ...cmp, label: cmp.client_company_name, value: cmp.client_company_id }))
    const selectedComp = compOpts.find(d => d.client_company_name === comp)
    const siteO = selectedComp?.client_company_Usersites?.filter(d => d.site_name !== 'All') ?? []
    const siteOt = siteO.map(d => ({ ...d, label: d.site_name, value: d.site_id }))
    const technician = Array.isArray(data) ? data.filter(d => d.is_curr_site_user).map(d => ({ ...d, label: `${d.firstname} ${d.lastname}`, value: d.uuid })) : []
    const nonTechnician = Array.isArray(data) ? data.filter(d => !d.is_curr_site_user).map(d => ({ ...d, label: `${d.firstname} ${d.lastname}`, value: d.uuid })) : []
    setSiteOpts(siteOt)
    setEnterpriseOpts(compOpts)
    setEnterprise(selectedComp)
    if (siteName !== 'All') setSite(siteOt.find(d => d.site_name === siteName))

    setTechnicianOpts([...technicianOpts, ...technician])
    setNonTechnicianOpts([...nonTechnicianOpts, ...nonTechnician])
    setLead([])
    setTechnician([])
  }, [data])

  const validateForm = async () => {
    yup.addMethod(yup.string, 'conditionalRequired', function (message, condition) {
      return this.test('conditionalRequired', message, function (value) {
        const { path, createError } = this
        return condition() ? value != null && value !== '' : true
      })
    })

    const schema = yup.object().shape({
      site_id: yup.string().required('Site is required !'),
      manualWoNumber: yup.string().required('Work order is required !'),
      photoType: yup.string().conditionalRequired('Image Type is required!', () => type === enums.woType.InfraredScan && cameraType === 'FLIR'),
    })
    const payload = { site_id: facility ? facility.site_id : '', manualWoNumber, photoType: get(photoType, 'value', '') }
    const isValid = await validateSchema(payload, schema)

    const vendorErrorList = [...vendorList]
    const vendorErrors = []

    if (!isEmpty(vendorErrorList)) {
      vendorErrorList.forEach(d => {
        const err = {}
        if (isEmpty(d.vendor)) err['vendor'] = { error: true, msg: 'Vendor is required !' }
        if (isEmpty(d.contactsList)) err['contactsList'] = { error: true, msg: 'Contact is required !' }
        if (!isEmpty(err)) {
          d.error = err
          vendorErrors.push(true)
        }
      })
      setVendorList(vendorErrorList)
    }

    const reminderErrorList = [...reminderList]
    const reminderErrors = []
    if (!isEmpty(reminderErrorList)) {
      reminderErrorList.forEach(d => {
        const err = {}
        if (isEmpty(d.type)) err['type'] = { error: true, msg: 'Type is required !' }
        if (isEmpty(d.duration)) err['duration'] = { error: true, msg: 'Duration is required !' }
        if (!isEmpty(err)) {
          d.error = err
          reminderErrors.push(true)
        }
      })
      setReminderList(reminderErrorList)
    }

    setErrors(isValid)

    if (isValid === true && isEmpty(vendorErrors) && isEmpty(reminderErrors)) {
      if (isEmpty(lead) && isEmpty(technician) && isEmpty(vendorList)) {
        createRequestBody(false)
      } else {
        setOpenEmailDrawer(true)
      }
    }
  }
  const onFocus = key => setErrors({ ...errors, [key]: null })
  const createRequestBody = async (sendEmail = true) => {
    const [dueHours, dueMinutes] = dueDate.time.split(':')
    const [startHours, startMinutes] = startDate.time.split(':')

    const vendorContact = []
    const notes = []
    vendorList.forEach(
      d => (
        vendorContact.push({
          is_deleted: false,
          vendor_id: get(d, 'vendor.value', null),
          contacts_list: get(d, 'contactsList', []).map(val => ({
            workorders_vendor_contacts_mapping_id: null,
            contact_id: get(val, 'value', null),
            is_deleted: false,
          })),
        }),
        notes.push({
          vendor_id: get(d, 'vendor.value', null),
          notes: get(d, 'notes', ''),
        })
      )
    )

    const startLocalDate = new Date(Date.UTC(startDate.year, startDate.month - 1, startDate.day, startHours, startMinutes)).toISOString()
    const formattedDate = formattedTimeLocalToUTC(startLocalDate)

    const dueLocalDate = new Date(Date.UTC(dueDate.year, dueDate.month - 1, dueDate.day, dueHours, dueMinutes)).toISOString()
    const formattedEndDate = formattedTimeLocalToUTC(dueLocalDate)

    const req = {
      wo_id: null,
      manual_wo_number: manualWoNumber,
      client_company_id: facility.client_company_id,
      description: desc,
      start_date: moment(formattedDate, 'YYYY-MM-DDTHH:mm:ss.SSS[Z]').utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      site_id: facility.site_id,
      wo_type: type,
      wo_status: isPlanned === 'PLANNED' ? enums.woTaskStatus.Planned : enums.woTaskStatus.ReleasedOpen,
      due_date: moment(formattedEndDate, 'YYYY-MM-DDTHH:mm:ss.SSS[Z]').utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      workorder_technician_list: technician.map(d => ({ wo_technician_mapping_id: null, user_id: d.uuid, is_deleted: false, is_curr_site_user: d.is_curr_site_user })),
      po_number: PONumber,
      quote_status: isQuotes ? enums.QUOTES.STATUS.OPEN : null,
      responsible_party_id: get(responsibleParty, 'value', null),
      workorder_backoffice_list: lead.map(d => ({ wo_backoffice_user_mapping_id: null, user_id: d.uuid, is_deleted: false, is_curr_site_user: d.is_curr_site_user })),
      is_required_to_send_email: isQuotes ? false : sendEmail ? true : false,
      ir_visual_camera_type: type === enums.woType.InfraredScan ? (cameraType === 'FLIR' ? enums.CAMERA_TYPE.FLIR : enums.CAMERA_TYPE.FLUKE) : null,
      ir_visual_image_type: type === enums.woType.InfraredScan ? (cameraType === 'FLUKE' ? null : get(photoType, 'value', null)) : null,
      workorder_vendor_contacts_list: vendorContact,
      is_reminder_required: isReminder === 'YES' ? true : false,
      reminders_frequency_json: isReminder === 'YES' ? JSON.stringify(reminderList.map(d => ({ duration: d.duration, type: get(d, 'type.value', null) }))) : null,
      wo_vendor_notes_json: JSON.stringify(notes),
    }
    setLoading(true)
    submitData(req)

    //
  }
  const submitData = async data => {
    try {
      const res = await createAcceptanceWO(data)
      if (res.success > 0) {
        isQuotes ? Toast.success(`Quote created successfully !`) : Toast.success(`${workOrderTypesPath[type]['label']}  Workorder created successfully !`)
        if (noReDirect) {
          onClose()
          reFetch()
        } else {
          localStorage.setItem('selectedSiteId', facility.site_id)
          isQuotes ? history.push({ pathname: `${quoteTypesPath[type]['path']}/${res.data.wo_id}`, state: data }) : history.push({ pathname: `${workOrderTypesPath[type]['path']}/${res.data.wo_id}`, state: data })
        }
      } else Toast.error(res.message)
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
    }
    setLoading(false)
  }
  const onClose = () => {
    handleClose()
    setIsPlanned('RELEASED OPEN')
    setStartDate({ ...utils().getToday(), time: '12:00' })
    setDueDate({ ...utils().getToday(), time: '12:00' })
    setDesc('')
    setErrors({})
    setManualWoNumber('')
    setTechnician([])
    setLead([])
    setResponsibleParty([])
    setPhotoType(null)
    setVendorList([])
    setReminderList([])
    setReminder('NO')
  }
  const handledate = d => {
    setStartDate(d)
    setDueDate(d)
  }

  useEffect(() => {
    const newOptions = [...vendorAllOptions]
    const filteredOptions = filter(newOptions, obj => !vendorList.some(d => get(d, 'vendor.value', null) === obj.value))
    setVendorOptions(filteredOptions)
  }, [vendorList])

  const handlePONumberChange = value => {
    // Regular expression to match allowed characters
    const regex = /^[0-9a-zA-Z_&\-]*$/
    // Check if the input value matches the regular expression
    if (regex.test(value) || value === '') {
      setPONumber(value)
    }
  }

  const handleAddVendor = () => {
    setVendorList(prevList => [
      ...prevList,
      {
        id: prevList.length + 1,
        isDeleted: false,
        vendor: null,
        notes: '',
        contactsList: [],
        contactsOptions: [],
      },
    ])
  }
  const handleRemoveVendor = id => {
    let newVendorList = [...vendorList]
    const removeVendor = newVendorList.filter(item => item.id !== id).map((d, index) => ({ ...d, id: index + 1 }))
    setVendorList(removeVendor)
    setDeleteVendorOpen([false, 0])
  }
  const handleChangeVendor = (id, value, key) => {
    const newList = [...vendorList]
    const currectVendor = newList.find(d => d.id === id)
    currectVendor[key] = value

    if (key === 'vendor') {
      const options = get(currectVendor, 'vendor.contactsList', []).map(d => ({
        ...d,
        label: `${d.name} <${d.email}>`,
        value: d.contactId,
      }))
      currectVendor['contactsOptions'] = options
      currectVendor['contactsList'] = []
    }
    setVendorList(newList)
  }
  const handleAddReminders = () => {
    setReminderList(prev => [
      ...prev,
      {
        id: prev.length + 1,
        duration: null,
        type: null,
      },
    ])
  }
  const handleRemoveReminder = id => {
    const reminder = [...reminderList]
    const updatedreminder = reminder
      .filter(d => d.id !== id)
      .map((d, index) => ({
        ...d,
        id: index + 1,
      }))

    setReminderList(updatedreminder)
  }
  const handleChangeReminder = (id, value, key) => {
    const remider = [...reminderList]
    const currentReminder = remider.find(d => d.id === id)
    currentReminder[key] = value
    setReminderList(remider)
  }
  const handleErrorVendor = (name, id) => {
    const list = [...vendorList]
    const current = list.find(d => d.id === id)
    if (current) {
      if (!current.error) {
        current.error = {}
      }
      current.error[name] = null
      setVendorList(list)
    } else {
      console.error(`No item found with id: ${id}`)
    }
  }
  const handleErrorReminder = (name, id) => {
    const list = [...reminderList]
    const current = list.find(d => d.id === id)
    if (current) {
      if (!current.error) {
        current.error = {}
      }
      current.error[name] = null
      setReminderList(list)
    } else {
      console.error(`No item found with id: ${id}`)
    }
  }

  const handleSelectLead = (user, isFrom) => {
    if (isFrom) {
      setLead(prevLeads => [...prevLeads, user])
      setLeadOptions(prevLeads => prevLeads.map(lead => (lead.uuid === user.uuid ? { ...lead, isSelected: true, isSearch: false } : { ...lead, isSearch: false })))
      setNonLeadOptions(prevLeads => prevLeads.map(lead => (lead.uuid === user.uuid ? { ...lead, isSelected: true, isSearch: false } : { ...lead, isSearch: false })))
    } else {
      const leads = []
      const nonLeads = []

      leadOptions.forEach(d => {
        if (user.filter(lead => lead.uuid !== d.uuid)) {
          leads.push({ ...d, isSelected: false, isSearch: false })
        }
      })

      nonLeadOptions.forEach(d => {
        if (user.filter(lead => lead.uuid !== d.uuid)) {
          nonLeads.push({ ...d, isSelected: false, isSearch: false })
        }
      })

      setLeadOptions(leads)
      setNonLeadOptions(nonLeads)
      setLead(user)
    }
  }

  const handleSelectTech = (user, isFrom) => {
    if (isFrom) {
      setTechnician(prevLeads => [...prevLeads, user])
      setTechnicianOpts(prevLeads => prevLeads.map(lead => (lead.uuid === user.uuid ? { ...lead, isSelected: true, isSearch: false } : { ...lead, isSearch: false })))
      setNonTechnicianOpts(prevLeads => prevLeads.map(lead => (lead.uuid === user.uuid ? { ...lead, isSelected: true, isSearch: false } : { ...lead, isSearch: false })))
    } else {
      const technician = []
      const nonTechnician = []

      technicianOpts.forEach(d => {
        if (user.filter(lead => lead.uuid !== d.uuid)) {
          technician.push({ ...d, isSelected: false, isSearch: false })
        }
      })

      nonTechnicianOpts.forEach(d => {
        if (user.filter(lead => lead.uuid !== d.uuid)) {
          nonTechnician.push({ ...d, isSelected: false, isSearch: false })
        }
      })

      setTechnicianOpts(technician)
      setNonTechnicianOpts(nonTechnician)
      setTechnician(user)
    }
  }

  const handleOnSearchLeads = search => {
    let filteredRows = [...leadOptions]
    let filteredNonRows = [...nonLeadOptions]

    if (!isEmpty(search)) {
      filteredRows = filteredRows.map(row => (row.label.toLowerCase().includes(search.toLowerCase()) || row.email.toLowerCase().includes(search.toLowerCase()) ? { ...row, isSearch: false } : { ...row, isSearch: true }))
      filteredNonRows = filteredNonRows.map(row => (row.label.toLowerCase().includes(search.toLowerCase()) || row.email.toLowerCase().includes(search.toLowerCase()) ? { ...row, isSearch: false } : { ...row, isSearch: true }))
    } else {
      filteredRows = filteredRows.map(row => ({ ...row, isSearch: false }))
      filteredNonRows = filteredNonRows.map(row => ({ ...row, isSearch: false }))
    }

    setLeadOptions(filteredRows)
    setNonLeadOptions(filteredNonRows)
  }

  const handleOnSearchTechs = search => {
    let filteredRows = [...technicianOpts]
    let filteredNonRows = [...nonTechnicianOpts]

    if (!isEmpty(search)) {
      filteredRows = filteredRows.map(row => (row.label.toLowerCase().includes(search.toLowerCase()) || row.email.toLowerCase().includes(search.toLowerCase()) ? { ...row, isSearch: false } : { ...row, isSearch: true }))
      filteredNonRows = filteredNonRows.map(row => (row.label.toLowerCase().includes(search.toLowerCase()) || row.email.toLowerCase().includes(search.toLowerCase()) ? { ...row, isSearch: false } : { ...row, isSearch: true }))
    } else {
      filteredRows = filteredRows.map(row => ({ ...row, isSearch: false }))
      filteredNonRows = filteredNonRows.map(row => ({ ...row, isSearch: false }))
    }

    setTechnicianOpts(filteredRows)
    setNonTechnicianOpts(filteredNonRows)
  }

  return (
    <Drawer anchor='right' open={open} onClose={onClose} style={{ width: '100%' }}>
      <FormTitle title={`${isQuotes ? 'Create Quote' : `Create ${workOrderTypesPath[type]['label']} Work Order`}`} closeFunc={onClose} style={{ width: '100%' }} />
      <div className='d-flex' style={{ background: '#efefef', width: '60vw' }}>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100vh - 126px)', width: '615px' }}>
          <div style={{ padding: '10px' }}>
            <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
              <MinimalAutoComplete placeholder='Select Facility' value={facility} onChange={setFacility} options={facilityOpts} label='Facility' w={100} />
            </div>
          </div>
          <div style={{ padding: '0 10px' }}>
            <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
              <div className='text-bold pb-1'>{isQuotes ? 'Quote' : 'Work Order'} Details</div>
              <MinimalInput onFocus={e => onFocus('manualWoNumber')} error={errors.manualWoNumber} value={manualWoNumber} onChange={setManualWoNumber} placeholder={`Enter ${isQuotes ? 'Quote' : 'Work Order'} Number`} label={isQuotes ? 'Quote#' : 'WO#'} w={100} />
              {type === enums.woType.Maintainance && <MinimalInput onFocus={e => onFocus('PONumber')} value={PONumber} onChange={handlePONumberChange} placeholder='Enter PO Number' label='PO#' w={100} />}
              <div className='d-flex justify-content-between'>
                <MinimalDatePicker date={startDate} setDate={d => handledate(d)} isTimeRequire={true} label={`${isQuotes ? 'Quote' : 'Start'} Date`} w={50} minimumDate={utils().getToday()} />
                <MinimalDatePicker date={dueDate} setDate={setDueDate} isTimeRequire={true} label={`${isQuotes ? 'Quote' : ''} Due Date`} w={50} minimumDate={startDate} minTime={startDate.time} labelStyles={{ marginLeft: '7px' }} InputStyles={{ marginLeft: '7px' }} />
              </div>

              {!noReDirect && !isQuotes && <MinimalStatusSelector label='Select default status' options={['Planned', 'Released Open']} value={isPlanned} onChange={setIsPlanned} w={100} />}
              <MinimalTextArea value={desc} onChange={e => setDesc(e.target.value)} placeholder='Add description...' label='Description' w={100} maxLength='200' />
            </div>
          </div>
          <div style={{ padding: '10px' }}>
            <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
              <div className='text-bold pb-1'>Team Details</div>
              <CustomAutoCompleteWithAdd
                isMulti
                placeholder='Select Leads'
                value={lead}
                onChange={handleSelectLead}
                onSearch={handleOnSearchLeads}
                options={leadOptions.filter(lead => !lead.isSelected && !lead.isSearch)}
                nonOptions={nonLeadOptions.filter(lead => !lead.isSelected && !lead.isSearch)}
                label='Leads'
                w={100}
                isLoading={backOfficeLoading}
              />
              {!isQuotes && (
                <CustomAutoCompleteWithAdd
                  isMulti
                  onFocus={e => onFocus('technician')}
                  error={errors.technician}
                  placeholder='Select Technicians'
                  value={technician}
                  onChange={handleSelectTech}
                  onSearch={handleOnSearchTechs}
                  options={technicianOpts.filter(lead => !lead.isSelected && !lead.isSearch)}
                  nonOptions={nonTechnicianOpts.filter(lead => !lead.isSelected && !lead.isSearch)}
                  label='Technicians'
                  w={100}
                  isLoading={technicianDropdownLoading}
                />
              )}
              <MinimalAutoComplete placeholder='Select Responsible Party' value={responsibleParty} onChange={setResponsibleParty} options={responsiblePartyOptions} label='Responsible Party' w={100} isClearable />
            </div>
          </div>
          {type === enums.woType.InfraredScan && (
            <div style={{ padding: '10px 10px' }}>
              <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
                <div className='text-bold pb-1'>IR Camera Details</div>
                <MinimalStatusSelector label='Select Camera Type' options={['FLIR', 'FLUKE']} value={cameraType} onChange={setCameraType} w={100} />
                {cameraType === 'FLIR' && <MinimalAutoComplete placeholder='Select Photo Type to Upload' value={photoType} onChange={setPhotoType} options={photoTypeOptions} label='Photo Type to Upload' w={100} onFocus={e => onFocus('photoType')} error={errors.photoType} />}
              </div>
            </div>
          )}
        </div>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100vh - 126px)', width: '615px' }}>
          <div style={{ padding: '10px' }}>
            <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
              <div className='d-flex justify-content-between align-items-center mb-3'>
                <div className='text-bold pb-1'>Third Party Vendor</div>
                <MinimalButton text='Add Vendor' variant='contained' color='primary' onClick={() => handleAddVendor()} />
              </div>
              {vendorList.map(d => {
                return (
                  <FormSection title={`Vendor#${d.id}`} keepOpen isRemove onRemove={e => (isEmpty(get(d, 'contactsList', '')) && isEmpty(get(d, 'vendor', '')) && isEmpty(get(d, 'notes', '')) ? handleRemoveVendor(d.id) : setDeleteVendorOpen([true, d.id]), e.stopPropagation())}>
                    <MinimalAutoComplete placeholder='Select Vendor' value={get(d, 'vendor', null)} onChange={value => handleChangeVendor(d.id, value, 'vendor')} options={vendorOptions} label='Vendor' w={100} error={get(d, 'error.vendor', '')} onFocus={() => handleErrorVendor('vendor', d.id)} isClearable />
                    <MinimalAutoComplete
                      isMulti
                      placeholder='Select Contacts'
                      value={get(d, 'contactsList', [])}
                      onChange={value => handleChangeVendor(d.id, value, 'contactsList')}
                      options={get(d, 'contactsOptions', [])}
                      label='Contacts'
                      w={100}
                      isLoading={backOfficeLoading}
                      error={get(d, 'error.contactsList', '')}
                      onFocus={() => handleErrorVendor('contactsList', d.id)}
                    />
                    <MinimalTextArea value={get(d, 'notes', '')} onChange={e => handleChangeVendor(d.id, e.target.value, 'notes')} placeholder='Write Here...' label='Notes' w={100} maxLength='200' />
                  </FormSection>
                )
              })}
            </div>
          </div>
          {/* Reminder Section */}
          {/* <div style={{ padding: '0 10px' }}>
            <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
              <div className='text-bold mb-2'>Reminders</div>
              <MinimalStatusSelector options={['Yes', 'No']} value={isReminder} onChange={setReminder} w={100} />
              {isReminder === 'YES' && (
                <>
                  <div className='d-flex justify-content-between align-items-center mt-3'>
                    <div className='text-bold pb-1'>Add Reminder </div>
                    <MinimalButton text='Add' variant='contained' color='primary' onClick={() => handleAddReminders()} />
                  </div>
                  {!isEmpty(reminderList) && (
                    <div className='d-flex align-items-center mt-2'>
                      <div className='text-bold' style={{ width: '10%' }}>
                        SR#
                      </div>
                      <div className='text-bold' style={{ width: '41%' }}>
                        Duration
                      </div>
                      <div className='text-bold'>Days/Hours</div>
                    </div>
                  )}
                  {reminderList.map(d => {
                    return (
                      <div key={d.id} className='d-flex mt-2'>
                        <div className='d-flex justify-content-center align-items-center text-bold mr-2' style={{ width: '40px', height: '40px', borderRadius: '4px', color: '#000', background: '#e0e0e0', textAlign: 'center' }}>
                          {d.id}
                        </div>
                        <MinimalInput min={1} type='number' w={40} baseStyles={{ marginBottom: 0 }} placeholder='Enter Duration' value={get(d, 'duration', null)} onChange={value => handleChangeReminder(d.id, value, 'duration')} error={get(d, 'error.duration', '')} onFocus={() => handleErrorReminder('duration', d.id)} />
                        <MinimalAutoComplete w={40} baseStyles={{ margin: 0 }} options={reminderOptions} value={get(d, 'type', null)} onChange={value => handleChangeReminder(d.id, value, 'type')} error={get(d, 'error.type', '')} onFocus={() => handleErrorReminder('type', d.id)} />
                        <FloatingButton onClick={() => handleRemoveReminder(d.id)} icon={<RemoveIcon fontSize='small' />} style={{ background: theme.palette.primary.main, color: '#fff', width: '42px', height: '42px', borderRadius: '4px', marginLeft: '10px' }} />
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          </div> */}
        </div>
      </div>

      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A6', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <Button variant='contained' color='default' className='nf-buttons' disableElevation onClick={onClose}>
          Cancel
        </Button>
        <Button variant='contained' color='primary' className='nf-buttons' disableElevation style={{ marginLeft: '10px' }} disabled={loading} onClick={validateForm}>
          {loading ? 'Adding...' : 'Add'}
          {loading && <CircularProgress size={20} thickness={5} style={{ color: '#fff', marginLeft: '10px' }} />}
        </Button>
      </div>
      <Dialog open={isOpenEmailDrawer} aria-labelledby='draggable-dialog-title'>
        <div className='d-flex flex-row justify-content-between align-items-center px-3 py-2' style={{ width: '400px', background: '#e0e0e080' }}>
          <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'EudoxusSans-Medium' }}>Send Email</div>
          <IconButton onClick={() => setOpenEmailDrawer(false)} size='small'>
            <CloseIcon fontSize='small' />
          </IconButton>
        </div>
        <div className='px-3 py-3' style={{ width: '400px' }}>
          Would you like to send an email notification to the assigned leads, technician and external vendors for Work Order {manualWoNumber} ?
        </div>
        <div className='content-bar bottom-bar mx-2'>
          <MinimalButton variant='contained' color='default' text='Cancel' onClick={() => setOpenEmailDrawer(false)} />
          <MinimalButton variant='contained' color='default' text="Don't Send" onClick={() => createRequestBody(false)} style={{ marginLeft: '10px' }} />
          <MinimalButton variant='contained' color='primary' text='Send' loadingText='Creating...' onClick={createRequestBody} disabled={loading} loading={loading} style={{ marginLeft: '10px' }} />
        </div>
      </Dialog>
      {isDeleteVendorOpen[0] && <DialogPrompt title='Delete Vendor' text='Are you sure you want to delete this vendor?' open={isDeleteVendorOpen[0]} ctaText='Delete' action={() => handleRemoveVendor(isDeleteVendorOpen[1])} handleClose={() => setDeleteVendorOpen([false, 0])} />}
    </Drawer>
  )
}

export default CreateAccWO
