import { useMemo, useCallback, useEffect, useState } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import { TimeGrid } from 'react-big-calendar/lib/TimeGrid'
import { get, isArray, isEmpty } from 'lodash'
import moment from 'moment'
import $ from 'jquery'

import { Toast } from 'Snackbar/useToast'
import { Tooltip, Modal, IconButton, Checkbox } from '@material-ui/core'
import AccessTimeOutlinedIcon from '@material-ui/icons/AccessTimeOutlined'
import CheckCircleOutlineOutlinedIcon from '@material-ui/icons/CheckCircleOutlineOutlined'
import UpdateOutlinedIcon from '@material-ui/icons/UpdateOutlined'
import FindInPageOutlinedIcon from '@material-ui/icons/FindInPageOutlined'
import CloseIcon from '@material-ui/icons/Close'
import LaunchOutlinedIcon from '@material-ui/icons/LaunchOutlined'
import CustomToolbar from 'components/common/calendar-custom-tooltip'
import CustomEvent from 'components/common/calendar-custom-event'
import { LabelVal, StatusComponent } from 'components/common/others'
import { useTheme } from '@material-ui/core/styles'
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight'
import RotateLeftSharpIcon from '@material-ui/icons/RotateLeftSharp'
import Button from '@material-ui/core/Button'
import 'components/common/calendar-style.css'

import workorder from 'Services/WorkOrder/common'
import { getStatus } from '../onboarding/utils'
import enums from 'Constants/enums'
import { getFormatedDate } from 'helpers/getDateTime'

const localizer = momentLocalizer(moment)

const Calender = () => {
  const theme = useTheme()
  const [isModalOpen, setModalOpen] = useState(false)
  const [eventDetail, setEventDetail] = useState({})
  const { components } = useMemo(() => ({ components: { toolbar: CustomToolbar, event: CustomEvent } }), [])

  const [eventsReq, setEventsReq] = useState({
    startDate: null,
    endDate: null,
    status: null,
  })

  const [events, setEvents] = useState([])
  const [isMonthView, setIsMonthView] = useState(true)
  const [filterSideBar, setFilterSideBar] = useState(true)
  const [filteStatus, setFilteStatus] = useState({ planned: false, open: false, inProgress: false, completed: false })
  const [leadsList, setLeadsList] = useState([])
  const [techniciansList, setTechniciansList] = useState([])
  const [vendorsList, setVendorsList] = useState([])
  const [filterBtn, setFilterBtn] = useState(true)

  const [selectedLeads, setSelectedLeads] = useState([])
  const [selectedTechnicians, setSelectedTechnicians] = useState([])
  const [selectedVendors, setSelectedVendors] = useState([])
  const [view, setView] = useState('month')

  const numTechniciansSelected = selectedTechnicians?.length
  const numLeadsSelected = selectedLeads?.length
  const numVendorsSelected = selectedVendors?.length

  const fetchEvents = async () => {
    // Replace with your actual API call logic
    let newFilteStatus = []

    if (filteStatus.planned) newFilteStatus = [...newFilteStatus, enums.woTaskStatus.Planned]
    if (filteStatus.open) newFilteStatus = [...newFilteStatus, enums.woTaskStatus.ReleasedOpen]
    if (filteStatus.inProgress) newFilteStatus = [...newFilteStatus, enums.woTaskStatus.InProgress]
    if (filteStatus.completed) newFilteStatus = [...newFilteStatus, enums.woTaskStatus.Complete]

    try {
      $('#pageLoading').show()
      setFilterBtn(isEmpty(newFilteStatus) && isEmpty(selectedTechnicians) && isEmpty(selectedLeads) && isEmpty(selectedVendors))
      const payload = {
        start_date: moment(eventsReq.startDate).utc().format('YYYY-MM-DDT00:00:00[Z]'),
        end_date: moment(eventsReq.endDate).utc().format('YYYY-MM-DDT00:00:00[Z]'),
        status: isEmpty(newFilteStatus) ? null : newFilteStatus,
        technician_ids: isEmpty(selectedTechnicians) ? null : selectedTechnicians,
        lead_ids: isEmpty(selectedLeads) ? null : selectedLeads,
        vendor_ids: isEmpty(selectedVendors) ? null : selectedVendors,
        site_id: JSON.parse(localStorage.getItem('siteListForWO')),
      }
      const res = await workorder.getAllCalendarWorkorders(payload)
      if (res.success > 0) {
        const eventData = get(res, 'data.list', [])
        const formattedEvents = []

        eventData.map(d => {
          let start = moment.utc(d.startDate).toDate()
          let end = moment.utc(d.dueDate).toDate()
          let allDay = view === 'week' ? false : true
          formattedEvents.push({
            ...d,
            title: d.manualWoNumber,
            view,
            start,
            end,
            allDay,
            progress: ((get(d, 'statusWiseAssetCountObj.totalCount', 0) !== 0 ? get(d, 'statusWiseAssetCountObj.completedObwoAsset', 0) / get(d, 'statusWiseAssetCountObj.totalCount', 0) : 0) * 100).toFixed(0),
          })
        })
        setEvents(formattedEvents) // Assuming your API returns an array of events
        getLeadsAndTechniciansList(eventData)
      } else {
        setEvents([])
        getLeadsAndTechniciansList([])
        setLeadsList([])
        setTechniciansList([])
        setVendorsList([])
        if (isMonthView && res.success === -2 && res.message !== 'No data found') {
          Toast.error(res.message)
        } else if (res.success !== -2) {
          Toast.error(res.message)
        }
      }
      $('#pageLoading').hide()
    } catch (error) {
      $('#pageLoading').hide()
    }
  }

  const onRangeChange = useCallback(range => {
    let start, end
    if (isArray(range)) {
      // Handle week and day views
      start = range[0]
      end = range[range.length - 1]
      setIsMonthView(false)
    } else {
      // Handle month view
      start = range.start
      end = range.end
      setIsMonthView(true)
    }

    setEventsReq(pre => {
      return { ...pre, startDate: addOneDay(start), endDate: addOneDay(end) }
    })
  }, [])

  useEffect(() => {
    const updateEventsReq = () => {
      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      setEventsReq(pre => ({
        ...pre,
        startDate: startOfMonth,
        endDate: endOfMonth,
      }))
    }

    if (eventsReq.startDate) {
      fetchEvents()
    } else {
      updateEventsReq()
    }
  }, [eventsReq, filteStatus, selectedTechnicians, selectedLeads, selectedVendors])

  const addOneDay = date => {
    const result = new Date(date)
    result.setDate(result.getDate() + 1)
    return result
  }

  const getLeadsAndTechniciansList = list => {
    if (!isEmpty(list)) {
      const allLeadsLists = list.flatMap(wo => wo.woAssignedLeadsList)
      const filteredLeads = allLeadsLists.filter((item, index, self) => index === self.findIndex(t => t.userId === item.userId))
      setLeadsList(filteredLeads)

      const allTechniciansLists = list.flatMap(wo => wo.woAssignedTechniciansList)
      const filteredTechnicians = allTechniciansLists.filter((item, index, self) => index === self.findIndex(t => t.userId === item.userId))
      setTechniciansList(filteredTechnicians)

      const allVendorsLists = list.flatMap(wo => wo.woVendorsList)
      const filteredVendors = allVendorsLists.filter((item, index, self) => index === self.findIndex(t => t.vendorId === item.vendorId))
      setVendorsList(filteredVendors)
    }
  }

  const handleselectedLeadsAllClick = event => {
    if (numLeadsSelected > 0) {
      setSelectedLeads([])
    } else {
      const newSelecteds = leadsList
        .map(row => {
          return row.userId
        })
        .filter(id => id !== null)

      setSelectedLeads(newSelecteds)
    }
  }

  const handleLeadsClick = id => {
    const selectedIndex = selectedLeads.indexOf(id)
    let newSelected = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedLeads, id)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedLeads.slice(1))
    } else if (selectedIndex === selectedLeads.length - 1) {
      newSelected = newSelected.concat(selectedLeads.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selectedLeads.slice(0, selectedIndex), selectedLeads.slice(selectedIndex + 1))
    }

    setSelectedLeads(newSelected)
  }

  const isLeadsSelected = id => selectedLeads.indexOf(id) !== -1

  const handleTechniciansAllClick = event => {
    if (numTechniciansSelected > 0) {
      setSelectedTechnicians([])
    } else {
      const newSelecteds = techniciansList
        .map(row => {
          return row.userId
        })
        .filter(id => id !== null)

      setSelectedTechnicians(newSelecteds)
    }
  }

  const handleTechniciansClick = id => {
    const selectedIndex = selectedTechnicians.indexOf(id)
    let newSelected = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedTechnicians, id)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedTechnicians.slice(1))
    } else if (selectedIndex === selectedTechnicians.length - 1) {
      newSelected = newSelected.concat(selectedTechnicians.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selectedTechnicians.slice(0, selectedIndex), selectedTechnicians.slice(selectedIndex + 1))
    }

    setSelectedTechnicians(newSelected)
  }

  const isTechniciansSelected = id => selectedTechnicians.indexOf(id) !== -1

  const handlVendorsAllClick = event => {
    if (numVendorsSelected > 0) {
      setSelectedVendors([])
    } else {
      const newSelecteds = vendorsList
        .map(row => {
          return row.vendorId
        })
        .filter(id => id !== null)

      setSelectedVendors(newSelecteds)
    }
  }

  const handleVendorsClick = id => {
    const selectedIndex = selectedVendors.indexOf(id)
    let newSelected = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedVendors, id)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedVendors.slice(1))
    } else if (selectedIndex === selectedVendors.length - 1) {
      newSelected = newSelected.concat(selectedVendors.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selectedVendors.slice(0, selectedIndex), selectedVendors.slice(selectedIndex + 1))
    }

    setSelectedVendors(newSelected)
  }

  const isVendorsSelected = id => selectedVendors.indexOf(id) !== -1

  const toggleFilterSideBar = () => setFilterSideBar(!filterSideBar)

  const handleSelect = e => {
    if (!isEmpty(e)) {
      setEventDetail(e)
      setModalOpen(true)
    }
  }

  const clearFilters = () => {
    setFilteStatus({ planned: false, open: false, inProgress: false, completed: false })
    setSelectedLeads([])
    setSelectedTechnicians([])
    setSelectedVendors([])
    setFilterBtn(true)
  }

  const renderStatus = () => {
    const { color, label } = getStatus(get(eventDetail, 'status', 0))
    return <StatusComponent color={color} label={label} size='medium' />
  }

  const StatusMetric = ({ count = 0, toolTip, icon: Icon, color }) => (
    <Tooltip title={toolTip} placement='top'>
      <div className='d-flex justify-content-start align-items-center mr-1' style={{ border: '1px solid #e0e0e0', borderRadius: '4px', minWidth: '42px', padding: '2px' }}>
        <div className='mr-1 d-flex justify-content-center align-items-center' style={{ borderRadius: '4px', padding: '8px', background: `${count === 0 ? '#00000020' : `${color}35`}`, width: 20, height: 20 }}>
          <Icon fontSize='small' style={{ color: count === 0 ? '#00000050' : color, fontSize: 12 }} />
        </div>
        <div>
          <div style={{ fontSize: 12, opacity: count === 0 ? 0.4 : 1 }} className='text-bold'>
            {count}
          </div>
        </div>
      </div>
    </Tooltip>
  )

  const renderWOLineStatus = () => {
    return (
      <div className='d-flex align-items-center'>
        {StatusMetric({ toolTip: 'OPEN', count: get(eventDetail, 'statusWiseAssetCountObj.openObwoAsset', 0), icon: AccessTimeOutlinedIcon, color: '#3941F1' })}
        {StatusMetric({ toolTip: 'IN PROGRESS', count: get(eventDetail, 'statusWiseAssetCountObj.inprogressObwoAsset', 0), icon: UpdateOutlinedIcon, color: '#3291DD' })}
        {StatusMetric({ toolTip: 'READY FOR REVIEW', count: get(eventDetail, 'statusWiseAssetCountObj.readyForReviewObwoAsset', 0), icon: FindInPageOutlinedIcon, color: '#FA0B0B' })}
        {StatusMetric({ toolTip: 'COMPLETED', count: get(eventDetail, 'statusWiseAssetCountObj.completedObwoAsset', 0), icon: CheckCircleOutlineOutlinedIcon, color: '#41BE73' })}
      </div>
    )
  }

  const renderDueDateText = () => {
    if (get(eventDetail, 'status', '') === enums.woTaskStatus.Complete) return getFormatedDate(get(eventDetail, 'dueDate', '')?.split(' ')[0])
    const dueInText = get(eventDetail, 'dueIn', '')?.trim()

    return !isEmpty(get(eventDetail, 'dueDate', '')) ? (
      <span>
        {getFormatedDate(get(eventDetail, 'dueDate', '')?.split(' ')[0])} {`(${dueInText})`}
      </span>
    ) : (
      'N/A'
    )
  }

  const renderLeads = () => {
    const leadList = get(eventDetail, 'woAssignedLeadsList', [])

    if (!isEmpty(leadList)) {
      return (
        <div className='d-flex align-items-center flex-wrap'>
          {leadList.map(d => (
            <div key={d.userId} className='ml-2 mb-2'>
              <StatusComponent color='#848484' label={`${d.name}`} size='medium' />
            </div>
          ))}
        </div>
      )
    }
  }

  const renderTechnicians = () => {
    const technicianList = get(eventDetail, 'woAssignedTechniciansList', [])
    if (!isEmpty(technicianList)) {
      return (
        <div className='d-flex align-items-center flex-wrap'>
          {technicianList.map(d => (
            <div key={d.userId} className='ml-2 mb-2'>
              <StatusComponent color='#848484' label={`${d.name}`} size='medium' />
            </div>
          ))}
        </div>
      )
    }
  }

  const renderVendors = () => {
    const vendorsList = get(eventDetail, 'woVendorsList', [])
    if (!isEmpty(vendorsList)) {
      return (
        <div className='d-flex align-items-center flex-wrap'>
          {vendorsList.map(d => (
            <div key={d.vendorId} className='ml-2 mb-2'>
              <StatusComponent color='#848484' label={`${d.vendorName}`} size='medium' />
            </div>
          ))}
        </div>
      )
    }
  }

  const CustomCheckbox = ({ label, email, selected, onClick, style, checkBoxColor, indeterminate, isSelectAllLable = false }) => {
    const color = theme.palette.primary.main
    return (
      <div className='d-flex align-items-center' style={{ cursor: 'pointer', ...style }} onClick={onClick}>
        <Checkbox size='small' style={{ margin: 0, padding: 5, marginBottom: email ? '10px' : '0px', color: checkBoxColor && selected ? checkBoxColor : color }} indeterminate={indeterminate} checked={selected} onChange={onClick} />
        <div>
          {isSelectAllLable ? <div className='text-xs'>{label}</div> : <div className='text-xs text-bold'>{label}</div>}
          {email && <div style={{ fontSize: '10px', color: '#778899', marginBottom: '10px' }}>{email}</div>}
        </div>
      </div>
    )
  }

  const eventDetailModalStyle = {
    top: `50%`,
    left: `50%`,
    transform: `translate(-50%, -50%)`,
    position: 'absolute',
    background: '#fff',
    width: `${30}%`,
    maxHeight: 'calc(100vh - 130px)',
  }

  const handleViewChange = view => {
    setView(view)
  }

  return (
    <div style={{ background: '#fff', height: 'calc(100vh - 64px)', padding: '15px 5px 15px 5px' }} className={isMonthView === false && events.length === 0 ? 'hide-time-view' : ''}>
      <div className='calendar-div'>
        <div className='d-flex'>
          {filterSideBar && (
            <>
              <div id='style-1' style={{ minWidth: '225px', paddingRight: '5px', overflow: 'auto', height: 'calc(100vh + 40px)' }}>
                <div className='calendar-filter-title'>
                  <strong style={{ fontSize: '14px', marginLeft: '3px' }}>Leads</strong>
                </div>
                {isEmpty(leadsList) ? (
                  <div className='d-flex justify-content-center align-items-center'>
                    <p>Leads not available!</p>
                  </div>
                ) : (
                  <>
                    <CustomCheckbox isSelectAllLable={true} label='Select All' onClick={handleselectedLeadsAllClick} indeterminate={numLeadsSelected > 0 && numLeadsSelected < leadsList.length} selected={leadsList.length > 0 && numLeadsSelected === leadsList.length} />
                    <div style={{ marginTop: '10px' }} />
                    {!isEmpty(leadsList) &&
                      leadsList.map(lead => {
                        const isItemSelected = isLeadsSelected(lead.userId)
                        return <CustomCheckbox key={lead.userId} label={lead.name} email={lead.email} onClick={() => handleLeadsClick(lead.userId)} selected={isItemSelected} />
                      })}
                  </>
                )}

                <div className='calendar-filter-title'>
                  <strong style={{ fontSize: '14px', marginLeft: '3px' }}>Technicians</strong>
                </div>
                {isEmpty(techniciansList) ? (
                  <div className='d-flex justify-content-center align-items-center'>
                    <p>Technicians not available!</p>
                  </div>
                ) : (
                  <>
                    <CustomCheckbox isSelectAllLable={true} label='Select All' onClick={handleTechniciansAllClick} indeterminate={numTechniciansSelected > 0 && numTechniciansSelected < techniciansList.length} selected={techniciansList.length > 0 && numTechniciansSelected === techniciansList.length} />
                    <div style={{ marginTop: '10px' }} />
                    {!isEmpty(techniciansList) &&
                      techniciansList.map(technician => {
                        const isItemSelected = isTechniciansSelected(technician.userId)
                        return <CustomCheckbox key={technician.userId} label={technician.name} email={technician.email} onClick={() => handleTechniciansClick(technician.userId)} selected={isItemSelected} />
                      })}
                  </>
                )}

                <div className='calendar-filter-title'>
                  <strong style={{ fontSize: '14px', marginLeft: '3px' }}>Vendors</strong>
                </div>
                {isEmpty(vendorsList) ? (
                  <div className='d-flex justify-content-center align-items-center'>
                    <p>Vendors not available!</p>
                  </div>
                ) : (
                  <>
                    <CustomCheckbox isSelectAllLable={true} label='Select All' onClick={handlVendorsAllClick} indeterminate={numVendorsSelected > 0 && numVendorsSelected < vendorsList.length} selected={vendorsList.length > 0 && numVendorsSelected === vendorsList.length} />
                    <div style={{ marginTop: '10px' }} />
                    {!isEmpty(vendorsList) &&
                      vendorsList.map(vendor => {
                        const isItemSelected = isVendorsSelected(vendor.vendorId)
                        return <CustomCheckbox key={vendor.vendorId} label={vendor.vendorName} email={vendor.vendorEmail} onClick={() => handleVendorsClick(vendor.vendorId)} selected={isItemSelected} />
                      })}
                  </>
                )}

                <div className='calendar-filter-title'>
                  <strong style={{ fontSize: '14px', marginLeft: '3px' }}>Work Order Status</strong>
                </div>
                <CustomCheckbox label='Planned' onClick={() => setFilteStatus({ ...filteStatus, planned: !filteStatus.planned })} selected={filteStatus.planned} checkBoxColor='#ED3FDC99' />
                <CustomCheckbox label='Released Open' onClick={() => setFilteStatus({ ...filteStatus, open: !filteStatus.open })} selected={filteStatus.open} checkBoxColor='#003DDA99' />
                <CustomCheckbox label='In Progress' onClick={() => setFilteStatus({ ...filteStatus, inProgress: !filteStatus.inProgress })} selected={filteStatus.inProgress} checkBoxColor='#3291DD99' />
                <CustomCheckbox label='Completed' onClick={() => setFilteStatus({ ...filteStatus, completed: !filteStatus.completed })} selected={filteStatus.completed} checkBoxColor='#5D8C2199' />

                <Button size='small' style={{ marginTop: '10px', marginBottom: '10px' }} startIcon={<RotateLeftSharpIcon />} disabled={filterBtn} onClick={clearFilters} variant='contained' color='primary' className='nf-buttons ml-2' disableElevation>
                  Reset Filters
                </Button>
              </div>
            </>
          )}
          <div style={{ borderLeft: '0px solid #EAEAEA', width: '100%', marginBottom: '15px' }}>
            <div className='menu-toggle-filter' onClick={toggleFilterSideBar}>
              {!filterSideBar ? <KeyboardArrowRightIcon fontSize='small' /> : <KeyboardArrowLeftIcon fontSize='small' />}
            </div>
            <div style={{ marginLeft: '5px' }}>
              <Calendar popup={true} onSelectEvent={handleSelect} localizer={localizer} events={events} components={components} startAccessor='start' endAccessor='end' onRangeChange={onRangeChange} onView={handleViewChange} />
              {isMonthView === false && events.length === 0 && (
                <div className='d-flex justify-content-center align-items-center h-100'>
                  <strong> No data found </strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Modal open={isModalOpen} onClose={() => setModalOpen(false)}>
        <div style={eventDetailModalStyle} className='add-task-modal table-responsive' id='style-1'>
          <div className='d-flex flex-row justify-content-between align-items-center px-3 py-2' style={{ background: '#e0e0e080' }}>
            <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'EudoxusSans-Medium' }}>Work Order Detail</div>
            <div>
              <IconButton onClick={() => (eventDetail?.woId ? window.open(`../workorders/details/${eventDetail.woId}`) : '')} size='small'>
                <LaunchOutlinedIcon fontSize='small' />
              </IconButton>
              <IconButton onClick={() => setModalOpen(false)} size='small'>
                <CloseIcon fontSize='small' />
              </IconButton>
            </div>
          </div>
          <div style={{ padding: '16px' }}>
            <LabelVal inline label='WO#' value={get(eventDetail, 'manualWoNumber', '')} top={0} />
            <LabelVal inline label='Status' value={renderStatus()} top={12} />
            <LabelVal inline label='WO Type' value={enums.WO_TYPE_LIST.find(e => e.value === get(eventDetail, 'woType', 0))?.label} top={12} />
            <LabelVal inline label='PO#' value={get(eventDetail, 'poNumber', '')} top={12} />
            <LabelVal inline label='Start Date' value={eventDetail.startDate ? getFormatedDate(eventDetail.startDate.split('T')[0]) : 'N/A'} top={12} />
            <LabelVal inline label='Due Date' value={renderDueDateText()} top={12} />
            <LabelVal inline label='Description' value={get(eventDetail, 'description', '')} top={12} />
            <LabelVal inline label='Leads' value={renderLeads()} top={12} lableMinWidth={46} />
            <LabelVal inline label='Technicians' value={renderTechnicians()} top={12} lableMinWidth={85} />
            <LabelVal inline label='Vendors' value={renderVendors()} top={12} lableMinWidth={45} />
            <LabelVal inline label='Responsible Party' value={get(eventDetail, 'responsiblePartyName', '')} top={12} />
            <LabelVal inline label='WO Line Status' value={renderWOLineStatus()} top={12} />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Calender
