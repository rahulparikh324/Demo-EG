import React, { useState, useEffect } from 'react'
import Drawer from '@material-ui/core/Drawer'
import { FormTitle } from '../Maintainance/components'
import { MinimalDatePicker, MinimalTextArea, MinimalInput, MinimalAutoComplete, MinimalStatusSelector, CustomAutoCompleteWithAdd } from '../Assets/components'
import { isEmpty, isEqual, filter } from 'lodash'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import * as yup from 'yup'
import { validateSchema } from '../../helpers/schemaValidation'
import { Toast } from '../../Snackbar/useToast'
import { utils } from 'react-modern-calendar-datepicker'
import createAcceptanceWO from '../../Services/WorkOrder/createAcceptanceWO'
import useFetchData from 'hooks/fetch-data'
import { get, orderBy } from 'lodash'
import enums from 'Constants/enums'
import { photoTypeOptions, reminderOptions } from './utils'
import onBoardingWorkorder from 'Services/WorkOrder/on-boarding-wo'
import getAllTechnicianList from 'Services/User/getAllTechnicianList'
import DialogPrompt from 'components/DialogPrompt'
import getBackOfficeUserList from 'Services/User/getBackofficeUserList'
import { FloatingButton, MinimalButton } from 'components/common/buttons'
import Dialog from '@material-ui/core/Dialog'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import moment from 'moment'
import { FormSection } from 'components/common/others'
import { useTheme } from '@material-ui/core'
import RemoveIcon from '@material-ui/icons/Remove'
import jobScheduler from 'Services/jobScheduler'
import RefreshOutlinedIcon from '@material-ui/icons/RefreshOutlined'
import $ from 'jquery'
import { CustomInviteesTooltip } from './onboarding/utils'
import { formattedDateUTCToLocal, formattedTimeLocalToUTC } from 'helpers/getDateTime'

const styles = {
  paneHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #A6A6A6', padding: '12px' },
  bottomBar: { borderTop: '1px solid #A6A6A6', borderBottom: 'none', background: '#fff', marginTop: 'auto' },
  labelStyle: { fontWeight: 800 },
  inputStyle: { background: 'none', padding: '10px 16px', border: '1px solid #a1a1a1' },
}

function EditWO({ open, onClose, afterSubmit, obj, isQuote = false }) {
  const [startDate, setStartDate] = useState({ ...utils().getToday(), time: '12:00' })
  const [dueDate, setDueDate] = useState({ ...utils().getToday(), time: '12:00' })
  const [technician, setTechnician] = useState([])
  const [technicianOpts, setTechnicianOpts] = useState([])
  const [nonTechnicianOpts, setNonTechnicianOpts] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [desc, setDesc] = useState('')
  const [manualWoNumber, setManualWoNumber] = useState('')
  const [newTechnicianItem, setNewTechnicianItem] = useState([])
  const [responsibleParty, setResponsibleParty] = useState([])
  const [existTechnician, setExistTechnician] = useState(get(obj, 'technician_mapping_list', []))
  const [PONumber, setPONumber] = useState('')
  const [lead, setLead] = useState([])
  const [leadOptions, setLeadOptions] = useState([])
  const [nonLeadOptions, setNonLeadOptions] = useState([])
  const [isOpenEmailDrawer, setOpenEmailDrawer] = useState(false)
  const [newLeadItem, setNewLeadItem] = useState([])
  const [cameraType, setCameraType] = useState('FLIR')
  const [photoType, setPhotoType] = useState(null)
  const [vendorList, setVendorList] = useState([])
  const [isDeleteVendorOpen, setDeleteVendorOpen] = useState([false, 0])
  const [isReminder, setReminder] = useState('NO')
  const [reminderList, setReminderList] = useState([])
  const [vendorOptions, setVendorOptions] = useState([])
  const [vendorAllOptions, setVendorAllOptions] = useState()
  const [isRequiredToSendEmail, setIsRequiredToSendEmail] = useState(true)

  const theme = useTheme()

  const handleLeadFormatter = lead => {
    const newList = orderBy(lead, [d => d.firstname && d.firstname.toLowerCase()], 'asc')
    const currSiteUsers = newList.filter(d => d.is_curr_site_user).map(d => ({ ...d, label: `${d.firstname} ${d.lastname}`, value: d.uuid }))
    const nonSiteUsers = newList.filter(d => !d.is_curr_site_user).map(d => ({ ...d, label: `${d.firstname} ${d.lastname}`, value: d.uuid }))

    setLeadOptions(currSiteUsers)
    setNonLeadOptions(nonSiteUsers)
    return newList
  }

  const { loading: backOfficeLoading, data: backOfficeUser } = useFetchData({ fetch: getBackOfficeUserList, payload: { siteId: obj.site_id }, formatter: d => handleLeadFormatter(get(d, 'list', [])) })

  const { data, loading: technicianDropdownLoading } = useFetchData({ fetch: getAllTechnicianList, payload: { siteId: obj.site_id }, formatter: d => handleFormatter(get(d, 'list', [])), condition: !isQuote })

  const handleFormatter = technicianList => {
    const technician = orderBy(technicianList, [d => d.firstname && d.firstname.toLowerCase()], 'asc')
    return technician
  }

  const { loading: jobSchedulerLoading } = useFetchData({ fetch: jobScheduler.getDropdown, formatter: d => handleVendorFormatter(get(d, 'data.workorderVendorContactsList', [])) })

  const payload = { wo_id: obj.wo_id }
  const { loading: contactsLoading, data: contactsData, reFetch } = useFetchData({ fetch: jobScheduler.getContactsList, payload, formatter: d => get(d, 'data', []) })

  const handleVendorFormatter = vendor => {
    const options = vendor.map(d => ({
      ...d,
      label: `${d.vendorName} -> ${d.vendorEmail}`,
      value: d.vendorId,
    }))
    setVendorOptions(options)
    setVendorAllOptions(options)
  }

  // responsible party
  const { data: responsiblePartyOptions, loading: resPartyDropdownLoading } = useFetchData({ fetch: onBoardingWorkorder.responsibleParty, formatter: d => handleResponsivePartyFormatter(get(d, 'data.list', [])) })

  const handleResponsivePartyFormatter = data => {
    const options = data.map(d => ({ label: d.responsiblePartyName, value: d.responsiblePartyId }))
    return options
  }

  useEffect(() => {
    jobSchedulerLoading ? $('#pageLoading').show() : $('#pageLoading').hide()
  }, [jobSchedulerLoading])

  useEffect(() => {
    const startD = new Date(formattedDateUTCToLocal(obj.start_date))
    const startTime = startD.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    const dueD = obj.due_date === '0001-01-01T00:00:00' ? new Date() : new Date(formattedDateUTCToLocal(obj.due_date))
    const dueTime = dueD.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

    setStartDate({ month: startD.getMonth() + 1, day: startD.getDate(), year: startD.getFullYear(), time: startTime })
    setDueDate(!isEmpty(obj.due_date) ? { month: dueD.getMonth() + 1, day: dueD.getDate(), year: dueD.getFullYear(), time: dueTime } : null)
    setDesc(obj.description)
    setManualWoNumber(obj.manual_wo_number)
    if (isEmpty(get(obj, 'responsible_party_name', null))) {
      setResponsibleParty([])
    } else {
      setResponsibleParty({ label: get(obj, 'responsible_party_name', null), value: get(obj, 'responsible_party_id', null) })
    }
    if (get(obj, 'ir_visual_image_type', null) === null) {
      setPhotoType(null)
    } else {
      const photo = photoTypeOptions.find(d => d.value === get(obj, 'ir_visual_image_type', null))
      setPhotoType(photo)
    }
    if (get(obj, 'ir_visual_camera_type', null) !== null) {
      setCameraType(obj.ir_visual_camera_type === enums.CAMERA_TYPE.FLIR ? 'FLIR' : 'FLUKE')
    }
    if (data && obj) {
      const technician = Array.isArray(data) ? data.map(d => ({ ...d, label: `${d.firstname} ${d.lastname}`, value: d.uuid })) : []
      if (technician.length) {
        const filteredTechnicians = technician.filter(newTech => !technicianOpts.some(existingTech => existingTech.uuid === newTech.value) && newTech.is_curr_site_user)
        const filteredNonTechnicians = technician.filter(newTech => !nonTechnicianOpts.some(existingTech => existingTech.uuid === newTech.value) && !newTech.is_curr_site_user)

        if (filteredTechnicians.length > 0) {
          setTechnicianOpts(prevOpts => [...prevOpts, ...filteredTechnicians])
        }

        if (filteredNonTechnicians.length > 0) {
          setNonTechnicianOpts(prevOpts => [...prevOpts, ...filteredNonTechnicians])
        }

        const filteredData = Array.isArray(data) ? data.filter(d => get(obj, 'technician_mapping_list', []).some(tech => tech.user_id === d.uuid)) : []

        const matchingTechnicians = get(obj, 'technician_mapping_list', []).map(tech => {
          const matchingData = filteredData.find(d => tech.user_id === d.uuid)
          if (matchingData) {
            return { ...tech, email: matchingData.email }
          }
          return tech
        })

        const newTechnicians = matchingTechnicians.map(d => ({ ...d, label: `${d.firstname} ${d.lastname}`, value: d.user_id, mapping: d.wo_technician_mapping_id }))
        setTechnician(newTechnicians)
        setTechnicianOpts(preTechnicians => [...preTechnicians.map(lead => ({ ...lead, isSelected: newTechnicians.some(newL => newL.value === lead.uuid) })), ...newTechnicians.filter(newL => !preTechnicians.some(lead => lead.uuid === newL.value))])
      }

      if (!isEmpty(obj.po_number)) {
        setPONumber(obj.po_number)
      }
    }
    if (backOfficeUser && obj) {
      const leadList = Array.isArray(backOfficeUser) ? backOfficeUser.map(d => ({ ...d, label: `${d.firstname} ${d.lastname}`, value: d.uuid })) : []
      if (leadList.length) {
        const filteredLead = leadList.filter(newLead => !leadOptions.some(val => val.uuid === newLead.value) && newLead.is_curr_site_user)
        const filteredNonLead = leadList.filter(newLead => !nonLeadOptions.some(val => val.uuid === newLead.value) && !newLead.is_curr_site_user)

        if (filteredLead.length > 0) {
          setLeadOptions(prevOpts => [...prevOpts, ...filteredLead])
        }

        if (filteredNonLead.length > 0) {
          setNonLeadOptions(prevOpts => [...prevOpts, ...filteredNonLead])
        }

        const filteredLeadData = Array.isArray(backOfficeUser) ? backOfficeUser.filter(d => get(obj, 'backoffice_mapping_list', []).some(lead => lead.user_id === d.uuid)) : []

        const matchingLead = get(obj, 'backoffice_mapping_list', []).map(lead => {
          const matchingData = filteredLeadData.find(d => lead.user_id === d.uuid)
          if (matchingData) {
            return { ...lead, email: matchingData.email }
          }
          return lead
        })

        const newLead = matchingLead.map(d => ({ ...d, label: `${d.firstname} ${d.lastname}`, value: d.user_id, mapping: d.wo_backoffice_user_mapping_id }))
        setLead(newLead)
        setLeadOptions(prevLeads => [...prevLeads.map(lead => ({ ...lead, isSelected: newLead.some(newL => newL.value === lead.uuid) })), ...newLead.filter(newL => !prevLeads.some(lead => lead.uuid === newL.value))])
      }
    }

    // vendor logic
    const notesJson = JSON.parse(get(obj, 'wo_vendor_notes_json', '{}'))
    const exiVendor = get(obj, 'workorder_vendor_contacts_list', []).map((val, index) => {
      const options = vendorOptions
        .find(d => d.value === val.vendor_id)
        ?.contactsList.map(d => ({
          ...d,
          label: `${d.name} <${d.email}>`,
          value: d.contactId,
        }))
      const findNotes = notesJson.find(d => d.vendor_id === val.vendor_id)

      return {
        id: index + 1,
        isDeleted: false,
        vendor: { ...val, label: `${val.vendor_name} <${val.vendor_email}>`, value: val.vendor_id },
        notes: get(findNotes, 'notes', ''),
        contactsList: get(val, 'contacts_list', []).map(d => ({ ...d, label: `${d.name} <${d.email}>`, value: d.contact_id })),
        contactsOptions: options,
        isExising: true,
      }
    })
    setVendorList(exiVendor)
    setReminder(get(obj, 'is_reminder_required', false) === true ? 'YES' : 'NO')

    const reminderFrequency = JSON.parse(get(obj, 'reminders_frequency_json', '[]')) ?? []

    const newReminderList = reminderFrequency?.map((d, index) => ({
      id: index + 1,
      duration: get(d, 'duration', ''),
      type: reminderOptions.find(opt => opt.value === d.type),
    }))

    setReminderList(newReminderList)
  }, [data, obj, backOfficeUser])

  useEffect(() => {
    const list = get(obj, 'workorder_vendor_contacts_list', [])
    if (isEmpty(list) && isEmpty(vendorList)) {
      setIsRequiredToSendEmail(true)
    } else {
      const woList = list.map(item => ({
        contacts_list: item.contacts_list.map(contact => ({
          contactId: contact.contact_id,
          vendorId: contact.vendor_id,
        })),
      }))

      const newContactsList = vendorList
        .filter(item => !item.isDeleted)
        .map(item => ({
          contacts_list: item.contactsList.map(contact => ({
            contactId: contact.contact_id,
            vendorId: contact.vendor_id,
          })),
        }))
      setIsRequiredToSendEmail(isEqual(woList, newContactsList))
    }
  }, [obj, vendorList])

  const compareArray = (arr1, arr2) => {
    const userMap = arr1.reduce((map, item) => {
      map[item.user_id] = true
      return map
    }, {})

    const removedItemsArray = arr2.filter(item => !userMap[item.user_id]).map(removedItem => ({ ...removedItem, is_deleted: true }))

    const newItemsArray = newTechnicianItem.map(newItem => ({
      ...newItem,
      is_deleted: false,
      wo_technician_mapping_id: null,
      user_id: newItem.value,
    }))

    const newFinalItem = [...removedItemsArray, ...newItemsArray]

    return newFinalItem
  }

  const compareLeadArray = (arr1, arr2) => {
    const userMap = new Set(arr1.map(item => item.user_id))

    const removedItemsArray = arr2.filter(item => !userMap.has(item.user_id)).map(removedItem => ({ ...removedItem, is_deleted: true }))

    const newItemsArray = newLeadItem.map(newItem => ({
      ...newItem,
      is_deleted: false,
      wo_backoffice_user_mapping_id: null,
      user_id: newItem.value,
    }))

    return [...removedItemsArray, ...newItemsArray]
  }

  const askUserForEmail = () => {
    const updatedValue = {
      manual_wo_number: manualWoNumber,
      po_number: PONumber,
      start_date: startDate,
      due_date: dueDate,
      backoffice_mapping_list: lead.map(d => d.value),
      technician_mapping_list: technician.map(d => d.value),
      responsible_party_id: get(responsibleParty, 'value', null),
      description: desc,
    }
    const startD = new Date(obj.start_date)
    const dueD = new Date(obj.due_date)

    const startTime = moment(startD).format('HH:mm a')
    const dueTime = moment(dueD).format('HH:MM a')

    const defaultValue = {
      manual_wo_number: obj.manual_wo_number,
      po_number: obj.po_number,
      start_date: { month: startD.getMonth() + 1, day: startD.getDate(), year: startD.getFullYear(), time: startTime },
      due_date: { month: dueD.getMonth() + 1, day: dueD.getDate(), year: dueD.getFullYear(), time: dueTime },
      backoffice_mapping_list: get(obj, 'backoffice_mapping_list', []).map(d => d.user_id),
      technician_mapping_list: get(obj, 'technician_mapping_list', []).map(d => d.user_id),
      responsible_party_id: obj.responsible_party_id,
      description: obj.description,
    }

    const result = isEqual(updatedValue, defaultValue)

    if (result) {
      validateForm()
    } else {
      isEqual(lead, get(obj, 'backoffice_mapping_list', [])) && isRequiredToSendEmail && isEqual(technician, get(obj, 'technician_mapping_list', [])) ? validateForm() : setOpenEmailDrawer(true)
    }
  }

  const validateForm = async (sendEmail = false) => {
    yup.addMethod(yup.string, 'conditionalRequired', function (message, condition) {
      return this.test('conditionalRequired', message, function (value) {
        const { path, createError } = this
        return condition() ? value != null && value !== '' : true
      })
    })

    const schema = yup.object().shape({
      site_id: yup.string().required('Site is required !'),
      manual_wo_number: yup.string().required('Work Order Number is required !'),
      photoType: yup.string().conditionalRequired('Image Type is required!', () => get(obj, 'wo_type', null) === enums.woType.InfraredScan && cameraType === 'FLIR'),
    })

    const vendorErrorList = [...vendorList]
    const vendorErrors = []

    if (!isEmpty(vendorErrorList)) {
      vendorErrorList.forEach(d => {
        const err = {}
        if (isEmpty(d.vendor) && d.isDeleted === false) err['vendor'] = { error: true, msg: 'Vendor is required !' }
        if (isEmpty(d.contactsList) && d.isDeleted === false) err['contactsList'] = { error: true, msg: 'Contact is required !' }
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

    const newValue = compareArray(technician, existTechnician)
    const newLeadValue = compareLeadArray(lead, get(obj, 'backoffice_mapping_list', []))

    const [startHours, startMinutes] = startDate.time.split(':')
    const [dueHours, dueMinutes] = dueDate.time.split(':')

    const vendorContact = []
    const notes = []
    vendorList.forEach(
      d => (
        vendorContact.push({
          is_deleted: get(d, 'isDeleted', false),
          vendor_id: get(d, 'vendor.value', null),
          contacts_list: get(d, 'contactsList', []).map(val => ({
            workorders_vendor_contacts_mapping_id: get(val, 'workorders_vendor_contacts_mapping_id', null),
            contact_id: get(val, 'value', null),
            is_deleted: get(val, 'is_deleted', false),
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

    const payload = {
      wo_id: obj.wo_id,
      client_company_id: obj.client_company_id,
      description: desc,
      start_date: moment(formattedDate, 'YYYY-MM-DDTHH:mm:ss.SSS[Z]').utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      site_id: obj.site_id,
      wo_type: obj.wo_type,
      wo_status: obj.wo_status_id,
      manual_wo_number: manualWoNumber,
      due_date: moment(formattedEndDate, 'YYYY-MM-DDTHH:mm:ss.SSS[Z]').utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      workorder_technician_list: newValue ? newValue.map(d => ({ wo_technician_mapping_id: d.wo_technician_mapping_id, user_id: d.user_id, is_deleted: d.is_deleted, is_curr_site_user: d.is_curr_site_user })) : [],
      po_number: PONumber,
      responsible_party_id: get(responsibleParty, 'value', null),
      quote_status: obj.quote_status_id,
      workorder_backoffice_list: newLeadValue ? newLeadValue.map(d => ({ wo_backoffice_user_mapping_id: d.wo_backoffice_user_mapping_id, user_id: d.user_id, is_deleted: d.is_deleted, is_curr_site_user: d.is_curr_site_user })) : [],
      is_required_to_send_email: sendEmail ? true : false,
      ir_visual_camera_type: get(obj, 'wo_type', null) === enums.woType.InfraredScan ? (cameraType === 'FLIR' ? enums.CAMERA_TYPE.FLIR : enums.CAMERA_TYPE.FLUKE) : null,
      ir_visual_image_type: get(obj, 'wo_type', null) === enums.woType.InfraredScan ? (cameraType === 'FLUKE' ? null : get(photoType, 'value', null)) : null,
      photoType: get(photoType, 'value', ''),
      workorder_vendor_contacts_list: vendorContact,
      is_reminder_required: isReminder === 'YES' ? true : false,
      reminders_frequency_json: isReminder === 'YES' ? JSON.stringify(reminderList.map(d => ({ duration: d.duration, type: get(d, 'type.value', null) }))) : null,
      wo_vendor_notes_json: JSON.stringify(notes),
    }
    const isValid = await validateSchema(payload, schema)
    setErrors(isValid)
    delete payload.photoType
    if (isValid === true && isEmpty(vendorErrors) && isEmpty(reminderErrors)) createRequestBody(payload)
  }
  const onFocus = key => setErrors({ ...errors, [key]: null })
  const createRequestBody = async req => {
    setLoading(true)
    // console.log(req)
    submitData(req)
  }
  const submitData = async data => {
    try {
      const res = await createAcceptanceWO(data)
      if (res.success > 0) isQuote ? Toast.success(`Quote upated successfully !`) : Toast.success(`Workorder upated successfully !`)
      else Toast.error(res.message)
    } catch (error) {
      Toast.error('Something went wrong !')
    }
    setLoading(false)
    onClose()
    afterSubmit()
  }

  const handledate = d => {
    setStartDate(d)
    setDueDate(d)
  }

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
        isExising: false,
      },
    ])
    const newOptions = Array.isArray(vendorAllOptions) ? [...vendorAllOptions] : []
    const filteredOptions = filter(newOptions, obj => !vendorList.filter(v => v.isDeleted !== true).some(d => get(d, 'vendor.value', null) === obj.value))
    setVendorOptions(filteredOptions)
  }

  const handleChangeVendor = (id, value, key) => {
    const newList = [...vendorList]
    const currectVendor = newList.find(d => d.id === id)
    currectVendor[key] = value

    if (key === 'vendor') {
      const options = get(currectVendor, 'vendor.contactsList', []).map(d => ({
        ...d,
        label: `${d.name} -> ${d.email}`,
        value: d.contactId,
      }))
      currectVendor['contactsOptions'] = options
      currectVendor['contactsList'] = []

      const newOptions = Array.isArray(vendorAllOptions) ? [...vendorAllOptions] : []
      const filteredOptions = filter(newOptions, obj => !vendorList.filter(v => v.isDeleted !== true).some(d => get(d, 'vendor.value', null) === obj.value))
      setVendorOptions(filteredOptions)
    }
    setVendorList(newList)
  }
  const handleRemoveVendor = id => {
    let newVendorList = [...vendorList]
    newVendorList.forEach(item => {
      if (item.id === id) {
        if (item.isExising === true) {
          item.isDeleted = true
        }
      }
    })
    newVendorList = newVendorList.filter(item => !(item.id === id && item.isExising === false)).map((d, index) => ({ ...d, id: index + 1 }))
    setVendorList(newVendorList)

    const newOptions = Array.isArray(vendorAllOptions) ? [...vendorAllOptions] : []
    const filteredOptions = filter(newOptions, obj => !vendorList.filter(v => v.isDeleted !== true).some(d => get(d, 'vendor.value', null) === obj.value))
    setVendorOptions(filteredOptions)

    setDeleteVendorOpen([false, 0])
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

  const handleRefreshbtn = () => {
    reFetch()
  }

  const handleSelectLead = (user, isFrom) => {
    if (isFrom) {
      setLead(prevLeads => [...prevLeads, user])
      setLeadOptions(prevLeads => prevLeads.map(lead => (lead.uuid === user.uuid ? { ...lead, isSelected: true, isSearch: false } : { ...lead, isSearch: false })))
      setNonLeadOptions(prevLeads => prevLeads.map(lead => (lead.uuid === user.uuid ? { ...lead, isSelected: true, isSearch: false } : { ...lead, isSearch: false })))

      const newAddedItem = [user].filter(d => !lead.some(e => e.user_id === d.value))
      setNewLeadItem(newAddedItem)
    } else {
      const leads = []
      const nonLeads = []

      leadOptions.forEach(d => {
        if (user.filter(lead => lead.value !== d.value)) {
          leads.push({ ...d, isSelected: false, isSearch: false })
        }
      })

      nonLeadOptions.forEach(d => {
        if (user.filter(lead => lead.value !== d.value)) {
          nonLeads.push({ ...d, isSelected: false, isSearch: false })
        }
      })

      const newAddedItem = user.filter(d => !lead.some(e => e.user_id === d.value))
      setNewLeadItem(newAddedItem)

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

      const newAddedItem = [user].filter(d => !technician.some(e => e.user_id === d.value))
      setNewTechnicianItem(newAddedItem)
    } else {
      const technicians = []
      const nonTechnicians = []

      technicianOpts.forEach(d => {
        if (user.filter(lead => lead.uuid !== d.uuid)) {
          technicians.push({ ...d, isSelected: false, isSearch: false })
        }
      })

      nonTechnicianOpts.forEach(d => {
        if (user.filter(lead => lead.uuid !== d.uuid)) {
          nonTechnicians.push({ ...d, isSelected: false, isSearch: false })
        }
      })

      const newAddedItem = user.filter(d => !technician.some(e => e.user_id === d.value))
      setNewTechnicianItem(newAddedItem)

      setTechnicianOpts(technicians)
      setNonTechnicianOpts(nonTechnicians)
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
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title={isQuote ? 'Edit Quote' : obj.manual_wo_number} closeFunc={onClose} style={{ width: '100%' }} />
      <div className='d-flex' style={{ background: '#efefef', width: '60vw' }}>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100vh - 126px)', width: '615px' }}>
          <div style={{ padding: '10px' }}>
            <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
              <div className='text-bold pb-2'>{isQuote ? 'Quote' : 'Work Order'} Details</div>
              <MinimalInput onFocus={e => onFocus('manual_wo_number')} error={errors.manual_wo_number} value={manualWoNumber} onChange={setManualWoNumber} placeholder='Add Number' label={isQuote ? 'Quote#' : 'Manual WO#'} w={100} />
              {obj.wo_type === enums.woType.Maintainance && isQuote && <MinimalInput onFocus={e => onFocus('PONumber')} value={PONumber} onChange={handlePONumberChange} placeholder='Enter PO Number' label='PO#' w={100} />}
              <div className='d-flex justify-content-between'>
                <MinimalDatePicker date={startDate} setDate={d => handledate(d)} isTimeRequire={true} label={`${isQuote ? 'Quote' : 'Start'} Date`} w={100} labelStyles={styles.labelStyle} InputStyles={styles.inputStyle} minimumDate={utils().getToday()} />
                <MinimalDatePicker date={dueDate} setDate={setDueDate} isTimeRequire={true} label={isQuote ? 'Quote Due Date' : 'Due Date'} minimumDate={startDate} minTime={startDate.time} w={100} labelStyles={{ marginLeft: '7px' }} InputStyles={{ marginLeft: '7px' }} />
              </div>
              <MinimalTextArea value={desc} rows={3} onChange={e => setDesc(e.target.value)} w={100} placeholder='Add Description ..' label='Description' maxLength='200' />
            </div>
          </div>
          <div style={{ padding: '0 10px' }}>
            <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
              <div className='text-bold pb-2'>Team Details</div>
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
              {!isQuote && (
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
              <MinimalAutoComplete placeholder='Select Responsible Party' value={responsibleParty} onChange={setResponsibleParty} options={responsiblePartyOptions} label='Responsible Party' w={100} isClearable isLoading={resPartyDropdownLoading} />
            </div>
          </div>
          {obj.wo_type === enums.woType.InfraredScan && (
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
              {vendorList
                .filter(val => val.isDeleted === false)
                .map(d => {
                  return (
                    <FormSection title={`Vendor#${d.id}`} keepOpen isRemove onRemove={e => (isEmpty(get(d, 'contactsList', '')) && isEmpty(get(d, 'vendor', '')) && isEmpty(get(d, 'notes', '')) ? handleRemoveVendor(d.id) : setDeleteVendorOpen([true, d.id]), e.stopPropagation())}>
                      <MinimalAutoComplete
                        placeholder='Select Vendor'
                        value={get(d, 'vendor', null)}
                        onChange={value => handleChangeVendor(d.id, value, 'vendor')}
                        options={vendorOptions}
                        label='Vendor'
                        w={100}
                        error={get(d, 'error.vendor', '')}
                        onFocus={() => handleErrorVendor('vendor', d.id)}
                        isDisabled={get(d, 'isExising', false) === true}
                        isClearable
                      />
                      <MinimalAutoComplete
                        isMulti
                        placeholder='Select Contacts'
                        value={get(d, 'contactsList', [])}
                        onChange={value => handleChangeVendor(d.id, value, 'contactsList')}
                        options={get(d, 'contactsOptions', [])}
                        label='Contacts'
                        w={100}
                        isLoading={jobSchedulerLoading}
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
              <div className='d-flex justify-content-between m2-1 mb-3'>
                <div className='text-bold'>Reminders</div>
                <div className='d-flex align-items-center'>
                  <CustomInviteesTooltip list={orderBy(get(contactsData, 'contactsStatusList', []), [d => d.contactName && d.contactName.toLowerCase()], 'asc')}>
                    <div>
                      <div className='text-bold d-flex flex-column align-items-end'>Invitees</div>
                      <span style={{ color: '#41BE73', fontSize: '12px' }}>{contactsData?.acceptedContactsCount ? contactsData?.acceptedContactsCount : 0} Accepted</span> out of {contactsData?.totalContactsCount ? contactsData?.totalContactsCount : 0}
                    </div>
                  </CustomInviteesTooltip>
                  {!contactsLoading && (
                    <IconButton onClick={handleRefreshbtn} className='ml-3' style={{ width: '32px', height: '32px', backgroundColor: '#778899', color: '#fff', borderRadius: '3px' }}>
                      <RefreshOutlinedIcon fontSize='small' />
                    </IconButton>
                  )}
                  {contactsLoading && (
                    <div className='ml-3' style={{ width: '32px', height: '32px', backgroundColor: '#778899', borderRadius: '3px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <CircularProgress size={15} thickness={5} style={{ color: '#fff' }} />
                    </div>
                  )}
                </div>
              </div>
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

      <div style={{ ...styles.paneHeader, ...styles.bottomBar }}>
        <Button variant='contained' color='default' className='nf-buttons' disableElevation onClick={onClose}>
          Cancel
        </Button>
        <Button variant='contained' color='primary' className='nf-buttons mr-2' onClick={askUserForEmail} disableElevation disabled={loading}>
          {loading ? 'Updating...' : 'Update'}
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
          Would you like to send an email to update the team and external vendors about this Work Order {manualWoNumber} ?
        </div>
        <div className='content-bar bottom-bar mx-2'>
          <MinimalButton variant='contained' color='default' text='Cancel' onClick={() => setOpenEmailDrawer(false)} />
          <MinimalButton variant='contained' color='default' text="Don't Send" onClick={() => validateForm(false)} style={{ marginLeft: '10px' }} />
          <MinimalButton variant='contained' color='primary' text='Send' loadingText='Updating...' onClick={() => validateForm(true)} disabled={loading} loading={loading} style={{ marginLeft: '10px' }} />
        </div>
      </Dialog>
      {isDeleteVendorOpen[0] && <DialogPrompt title='Delete Vendor' text='Are you sure you want to delete this vendor?' open={isDeleteVendorOpen[0]} ctaText='Delete' action={() => handleRemoveVendor(isDeleteVendorOpen[1])} handleClose={() => setDeleteVendorOpen([false, 0])} />}
    </Drawer>
  )
}

export default EditWO
