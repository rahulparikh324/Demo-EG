import React, { useState, useEffect, useRef } from 'react'

import useFetchData from 'hooks/fetch-data'
import { camelizeKeys } from 'helpers/formatters'

import Drawer from '@material-ui/core/Drawer'
import RotateLeftSharpIcon from '@material-ui/icons/RotateLeftSharp'
import { FormTitle } from 'components/Maintainance/components'
import { StatusComponent, Menu, FilterPopup, PopupModal, MinimalRadio } from 'components/common/others'
import { MinimalButton, ActionButton } from 'components/common/buttons'
import { TableComponent } from 'components/common/table-components'
import SearchComponent from 'components/common/search'
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'

import RenderFrom from './form-controls'

import { isEmpty, get, chunk, startCase, omit } from 'lodash'
import { Toast } from 'Snackbar/useToast'
import enums from 'Constants/enums'
import { getStatus } from 'components/WorkOrders/onboarding/utils'
import WOViewLineMultiCopy from 'components/WorkOrders/WOViewLineMultiCopy'
import exportPDF from 'components/WorkOrders/exportPDF'

import getWOCategoryTaskByCategoryID from 'Services/WorkOrder/getWOCategoryTaskByCategoryID'
import getFormByWOTaskId from 'Services/WorkOrder/getFormByWOTaskId'
import deleteWOCategoryTask from 'Services/WorkOrder/deleteWOCategoryTask'
import copyFieldsFrom from 'Services/WorkOrder/copyFieldsFrom'
import getAllWOCategoryTaskByWOId from 'Services/WorkOrder/getAllWOCategoryTaskByWOId'
import getWOCategoryTaskByWOId from 'Services/WorkOrder/getWOCategoryTaskByWOId'

const TaskList = ({ open, onClose, obj, woStatusId, woId, showAllTask, masterForms, isForReview = false, equipmentListOptions = [] }) => {
  // console.log('TaskList', { open, onClose, obj, woStatusId, woId, showAllTask, masterForms, isForReview })
  //filters
  const [searchString, setSearchString] = useState('')
  const [techOptions, setTechOptions] = useState([])
  const [selectedStatus, setSelectedStatus] = useState({})
  const [selectedTechnician, setSelectedTechnician] = useState({})
  const statusOptions = enums.workOrderTaskStatusList.map(d => ({ label: d.status, value: d.id }))
  //data
  const [chunks, setChunks] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0)
  const [rows, setRows] = useState([])
  const [selectedRowObj, setSelectedRowObj] = useState({})
  const tableRef = useRef(null)
  //form data
  const removeSubmitFromForm = form => {
    // console.log(form, equipmentListOptions)
    if (isEmpty(form)) return {}
    const newForm = form
    const comps = []
    form.components.forEach(d => {
      if (d.key === 'footer') {
        const footerComp = d.components[0].components
        const finalFooter = footerComp.find(q => q.key === 'finalFooter')
        // const secFinalFooter = footerComp.find(q => q.key === 'testEquipmentCalibrationTable')
        if (!isEmpty(finalFooter)) {
          const calibrationTable = finalFooter.components.find(x => x.key === 'testEquipmentCalibrationTable')
          if (!isEmpty(calibrationTable)) {
            if (!isEmpty(get(calibrationTable, 'components[0].data.values', ''))) {
              calibrationTable.components[0].data.values = equipmentListOptions.map(d => ({ ...d, label: d.equipmentNumber, value: d.equipmentId }))
            }
          }
        }
        // } else if (!isEmpty(secFinalFooter)) {
        //   if (!isEmpty(get(secFinalFooter, 'components[0].data.values', ''))) {
        //     secFinalFooter.components[0].data.values = equipmentListOptions.map(d => ({ ...d, label: d.equipmentNumber, value: d.equipmentId }))
        //   }
        // } else if (finalFooter == undefined) {
        //   const footer = footerComp.find(q => q.key === 'footer')
        //   const secFooter = footer.components[0].components
        //   const thirdFooter = secFooter.find(q => q.key === 'footer')
        //   const forthFooter = thirdFooter.components[0].components
        //   const newFinalFooter = forthFooter.find(q => q.key === 'finalFooter')
        //   if (!isEmpty(newFinalFooter)) {
        //     const calibrationTable = newFinalFooter.components.find(x => x.key === 'testEquipmentCalibrationTable')
        //     if (!isEmpty(get(calibrationTable, 'components[0].data.values', ''))) {
        //       calibrationTable.components[0].data.values = equipmentListOptions.map(d => ({ ...d, label: d.equipmentNumber, value: d.equipmentId }))
        //     }
        //   }
        // }
      }
      if (d.key !== 'submit') comps.push(d)
    })
    newForm.components = comps
    return newForm
  }
  const formJSON = showAllTask ? {} : isForReview ? JSON.parse(obj.form_data.replaceAll(`"collapsed":true`, `"collapsed":false`)) : JSON.parse(obj.form_data)
  const [formData, setFormData] = useState(removeSubmitFromForm(formJSON))

  const [formLoading, setFormLoading] = useState(true)
  const [formDataToSubmit, setFormDataToSubmit] = useState({})
  const [currentForm, setCurrentForm] = useState({})
  const [isMultiCopyOpen, setMultiCopyOpen] = useState(false)
  const [anchorObject, setAnchorObject] = useState({})
  const [actionLoaderId, setActionLoaderId] = useState('')
  const [isCopyDataToActive, setCopyDataToActive] = useState(false)
  const [checkboxObj, setCheckBox] = useState({})
  const [isCopying, setCopying] = useState(false)
  const [sectionList, setSectionList] = useState([])
  const [isChoicesOpen, setIsChoicesOpen] = useState(false)
  const [selectedSections, setSelectedSection] = useState([])

  //
  const formatTasks = tasks => {
    if (isEmpty(tasks)) {
      onClose()
    }
    const technicianList = []
    const technicianIds = []
    if (!isEmpty(tasks)) {
      tasks.forEach(task => {
        if (task.technicianId && !technicianIds.includes(task.technicianId)) {
          technicianList.push({ label: task.technicianName, value: task.technicianId })
          technicianIds.push(task.technicianId)
        }
      })
      const chunks = chunk(tasks, 20)
      setChunks(chunks)
      setRows(chunks[0])
      if (tableRef) tableRef.current.scroll({ top: 0, behavior: 'smooth' })
      setCurrentChunkIndex(0)
      isEmpty(chunks) ? setHasMore(false) : setHasMore(chunks.length - 1 !== 0)
    }
    setTechOptions(technicianList)
    return tasks
  }
  const { loading, data, reFetch } = useFetchData({
    fetch: showAllTask ? (isForReview ? getWOCategoryTaskByWOId : getAllWOCategoryTaskByWOId) : getWOCategoryTaskByCategoryID,
    payload: showAllTask ? (isForReview ? { workOrderID: woId, status: enums.woTaskStatus.ReadyForReview } : woId) : { id: obj.wo_inspectionsTemplateFormIOAssignment_id },
    formatter: d => formatTasks(camelizeKeys(get(d, 'data', {}))),
  })
  //
  const multiCopyTooltip = `You can select the individual options to create multiple copies with the data of selected section pre-filled`
  const copyDataTooltip = `You can copy the data to other forms`
  const menuOptions = [
    { id: 1, name: 'Multi Copy', action: d => handleAction('MULTI_COPY', d), disabled: () => woStatusId === enums.woTaskStatus.Complete, tooltip: multiCopyTooltip },
    { id: 2, name: 'Copy Data To', action: d => handleAction('COPY_DATA', d), disabled: d => data.length < 2 || d.statusId === enums.woTaskStatus.Open || woStatusId === enums.woTaskStatus.Complete, tooltip: copyDataTooltip },
    { id: 3, name: 'Generate Report', action: d => handleAction('GENERATE_DEFECTIVE_REPORT', d), disabled: d => !d.defects },
    { id: 4, name: 'Delete', action: d => deleteTask(d), color: '#FF0000', disabled: d => d.isParentTask || d.statusId === enums.woTaskStatus.Complete || d.statusId === enums.woTaskStatus.Submitted || woStatusId === enums.woTaskStatus.Complete },
  ]
  let columns = [
    { name: 'Sr.No', render: d => (isForReview ? <div className='py-1'>{d.serialNumber}</div> : d.serialNumber) },
    { name: 'Identification', accessor: 'assetName' },
    { name: 'Parent', accessor: 'location' },
    { name: 'Technician', accessor: 'technicianName' },
    {
      name: 'Status',
      render: d => {
        const { color, label } = getStatus(d.statusId)
        return <StatusComponent color={color} label={label} size='small' />
      },
    },
    {
      name: 'Actions',
      render: d => <div className='d-flex align-items-center'>{isCopyDataToActive ? <RenderCheckBox data={d} /> : <Menu options={menuOptions} data={d} loading={actionLoaderId === d.wOcategorytoTaskMappingId} noToolip={false} width={130} />}</div>,
    },
  ]

  if (isForReview) {
    columns = columns.slice(0, 4)
  }
  //
  const RenderCheckBox = ({ data }) => {
    if (data.statusId === enums.woTaskStatus.Complete || data.statusId === enums.woTaskStatus.Submitted || data.wOcategorytoTaskMappingId === anchorObject.wOcategorytoTaskMappingId) return <></>
    else if (checkboxObj[data.wOcategorytoTaskMappingId]) return <ActionButton tooltip='DESELECT' icon={<CheckCircleIcon fontSize='small' />} action={e => handleCheckBoxChange(e, data)} />
    return <ActionButton tooltip='SELECT' icon={<RadioButtonUncheckedIcon fontSize='small' />} action={e => handleCheckBoxChange(e, data)} />
  }
  //handle on click of row
  const onRowClick = async data => {
    if (showAllTask) {
      const form = masterForms.find(f => f.form_id === data.formId)
      const formJSON = isEmpty(form) ? {} : isForReview ? JSON.parse(form.form_data.replaceAll(`"collapsed":true`, `"collapsed":false`)) : JSON.parse(form.form_data)
      setFormData(removeSubmitFromForm(formJSON))
    }
    setSelectedRowObj(data['wOcategorytoTaskMappingId'])
    setFormLoading(true)
    try {
      const res = await getFormByWOTaskId({ id: data.wOcategorytoTaskMappingId })
      const form = isEmpty(res.data.asset_form_data) ? {} : JSON.parse(res.data.asset_form_data)
      setFormDataToSubmit(form)
      setCurrentForm(res.data)
      setFormLoading(false)
    } catch (error) {
      setFormLoading(false)
    }
  }

  const handleCopyDataTo = async x => {
    try {
      setActionLoaderId(x.wOcategorytoTaskMappingId)
      const res = await getFormByWOTaskId({ id: x.wOcategorytoTaskMappingId })
      const form = isEmpty(res.data.asset_form_data) ? {} : JSON.parse(res.data.asset_form_data)
      setActionLoaderId('')
      const data = get(form, 'data', {})
      const sections = omit(data, ['pleaseSelectTests', 'header', 'nameplateInformation', 'footer'])
      const list = [
        { label: 'Header', value: 'header' },
        { label: 'Nameplate Information', value: 'nameplateInformation' },
      ]
      Object.keys(sections).forEach(key => {
        const isSelected = get(data, ['pleaseSelectTests', [key]], false)
        if (isSelected) list.push({ label: startCase(key), value: key })
      })
      list.push({ label: 'Results', value: 'footer' })
      setSectionList(list)
      setIsChoicesOpen(true)
    } catch (error) {
      setActionLoaderId('')
      Toast.error('Something went wrong !')
    }
  }
  const handleAction = async (type, data) => {
    setAnchorObject(data)
    if (type === 'MULTI_COPY') setMultiCopyOpen(true)
    // if (type === 'COPY_DATA') setCopyDataToActive(true)
    if (type === 'COPY_DATA') handleCopyDataTo(data)
    if (type === 'GENERATE_DEFECTIVE_REPORT') generateDefectiveReportPDF(data)
  }
  const deleteTask = async ({ wOcategorytoTaskMappingId }) => {
    try {
      setActionLoaderId(wOcategorytoTaskMappingId)
      const res = await deleteWOCategoryTask({ wOcategorytoTaskMapping_id: wOcategorytoTaskMappingId })
      if (res.success > 0) {
        Toast.success('Record deleted successfully!')
        reFetch()
      } else Toast.error(res.message)
      setActionLoaderId('')
    } catch (error) {
      setActionLoaderId('')
      Toast.error('Something went wrong !')
    }
  }
  const handleCheckBoxChange = (e, d) => {
    e.stopPropagation()
    setCheckBox({ ...checkboxObj, [d.wOcategorytoTaskMappingId]: !checkboxObj[d.wOcategorytoTaskMappingId] })
  }
  //handle page/chunk change
  const handlePageChange = () => {
    if (hasMore) {
      const index = currentChunkIndex + 1
      const nextPage = chunks[index]
      if (!isEmpty(nextPage)) {
        setRows(oldRows => [...oldRows, ...nextPage])
        setCurrentChunkIndex(prev => prev + 1)
        setHasMore(chunks.length - 1 !== index)
      }
    }
  }
  //change filters
  const handleStatusFilterChange = d => setSelectedStatus(d)
  const handleTechnicianFilterChange = d => setSelectedTechnician(d)
  const clearStatusFilter = () => setSelectedStatus({})
  const clearTechnicianFilter = () => setSelectedTechnician({})
  //filter side effect
  useEffect(() => {
    if (!isEmpty(data)) {
      let dataPostFilter = [...data]
      if (!isEmpty(searchString)) {
        dataPostFilter = data.filter(
          x =>
            (x.assetName !== null && x.assetName.toLowerCase().includes(searchString.toLowerCase())) ||
            (x.assetId !== null && x.assetId.toLowerCase().includes(searchString.toLowerCase())) ||
            (x.location !== null && x.location.toLowerCase().includes(searchString.toLowerCase())) ||
            (x.technicianName !== null && x.technicianName.toLowerCase().includes(searchString.toLowerCase()))
        )
      }
      if (!isEmpty(selectedStatus)) dataPostFilter = dataPostFilter.filter(x => x.statusId === selectedStatus.value)
      if (!isEmpty(selectedTechnician)) dataPostFilter = dataPostFilter.filter(x => x.technicianId === selectedTechnician.value)
      if (tableRef) tableRef.current.scroll({ top: 0, behavior: 'smooth' })
      setCurrentChunkIndex(0)
      const chunks = chunk(dataPostFilter, 20)
      setChunks(chunks)
      setRows(chunks[0])
      if (!isEmpty(chunks)) onRowClick(chunks[0][0])
      isEmpty(chunks) ? setHasMore(false) : setHasMore(chunks[0].length === 20)
    }
  }, [searchString, selectedStatus, selectedTechnician, data])
  //
  const copyData = async () => {
    const arr = []
    Object.keys(checkboxObj).forEach(key => checkboxObj[key] === true && arr.push(key))
    const payload = { containers: selectedSections, copy_from_wOcategorytoTaskMapping_id: anchorObject.wOcategorytoTaskMappingId, copy_to_wOcategorytoTaskMapping_id: arr }
    setCopying(true)
    try {
      const res = await copyFieldsFrom(payload)
      if (res.success > 0) Toast.success('Data copied successfully !')
      else Toast.error(res.message)
    } catch (error) {
      Toast.error('Something went wrong !')
    }
    setCopying(false)
    setCopyDataToActive(false)
    setCheckBox({})
    setSelectedSection([])
    reFetch()
  }
  const clearFilter = () => {
    setSelectedStatus({})
    setSelectedTechnician({})
    setSearchString('')
  }
  const checkFilterDisability = () => {
    return isEmpty(selectedStatus) && isEmpty(selectedTechnician) && isEmpty(searchString)
  }
  //generate defective report
  const generateDefectiveReportPDF = async data => {
    try {
      setActionLoaderId(data.wOcategorytoTaskMappingId)
      const res = await getFormByWOTaskId({ id: data.wOcategorytoTaskMappingId })
      const form = isEmpty(res.data.asset_form_data) ? {} : JSON.parse(res.data.asset_form_data)
      exportPDF({ wo: { asset_form_data: JSON.stringify({ ...formData, data: form.data }), form_category_name: obj.form_category_name, asset_form_name: obj.form_name, asset_form_description: data.description }, isFromSubmitted: true, isDefective: true })
      setActionLoaderId('')
    } catch (error) {
      setActionLoaderId('')
    }
  }
  // handle sections
  const handleSectionSelect = d => {
    if (selectedSections.includes(d.value)) setSelectedSection(x => x.filter(q => q !== d.value))
    else setSelectedSection(p => [...p, d.value])
  }
  const handleSectionSelectSubmit = () => {
    setIsChoicesOpen(false)
    setCopyDataToActive(true)
  }
  //
  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title={showAllTask ? (isForReview ? 'Review Tasks' : 'View Tasks') : !isEmpty(obj) ? 'Type - ' + obj.form_category_name : 'Type'} closeFunc={onClose} style={{ width: '100%', minWidth: '450px' }} />
      <div style={{ width: '95vw' }}>
        <div className='d-flex'>
          <div style={{ maxHeight: 'calc(100vh - 64px)', height: 'calc(100vh - 64px)', width: '40%', borderRight: '1px solid #eee' }}>
            <div style={{ width: '100%', padding: '18px 16px' }}>
              <div className='d-flex flex-row justify-content-between align-items-center'>
                <SearchComponent searchString={searchString} setSearchString={setSearchString} />
                <MinimalButton size='small' disabled={checkFilterDisability()} startIcon={<RotateLeftSharpIcon />} text='Reset Filters' onClick={clearFilter} variant='contained' color='primary' />
              </div>
              <div className='d-flex flex-row justify-content-start align-items-center mt-2'>
                {!isForReview && <FilterPopup selected={selectedStatus} onChange={handleStatusFilterChange} onClear={clearStatusFilter} placeholder='Status' options={statusOptions} baseClassName='mr-2' />}
                <FilterPopup selected={selectedTechnician} onChange={handleTechnicianFilterChange} onClear={clearTechnicianFilter} placeholder='Technician' options={techOptions} />
              </div>
            </div>
            <div ref={tableRef} className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 231px)', height: 'calc(100vh - 231px)', padding: '0 10px 10px 10px' }}>
              <TableComponent handlePageChange={handlePageChange} onRowClick={onRowClick} loading={loading} columns={columns} rowStyle={{ cursor: 'pointer' }} data={rows} selectedRow={selectedRowObj} setSelectedRow={setSelectedRowObj} selectedRowKey='wOcategorytoTaskMappingId' enabledRowSelection />
            </div>
            <div style={{ marginTop: 'auto', padding: '12px', borderTop: '1px solid #eee' }}>
              {isCopyDataToActive && <MinimalButton onClick={copyData} loading={isCopying} text='Copy' loadingText='Copying...' variant='contained' color='primary' disabled={isCopying || isEmpty(Object.keys(checkboxObj).filter(key => checkboxObj[key] === true))} baseClassName={`mr-2`} />}
              {isCopyDataToActive && <MinimalButton text='Cancel' onClick={() => setCopyDataToActive(false)} variant='contained' color='default' />}
            </div>
          </div>
          <div style={{ width: '60%' }}>
            <RenderFrom isEmpty={isEmpty(rows)} loading={formLoading} woStatusId={woStatusId} form={formData} currentForm={currentForm} submission={formDataToSubmit} reFetchList={reFetch} isForReview={isForReview} />
          </div>
        </div>
      </div>
      {isMultiCopyOpen && <WOViewLineMultiCopy open={isMultiCopyOpen} handleClose={() => setMultiCopyOpen(false)} afterSubmit={reFetch} obj={anchorObject} />}

      <PopupModal open={isChoicesOpen} onClose={() => setIsChoicesOpen(false)} title='Select Sections' handleSubmit={handleSectionSelectSubmit} cta='Confirm' width='40' disableCTA={isEmpty(selectedSections)}>
        <div className='text-bold mb-2'>Please select Sections which you need to copy.</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {sectionList.map(d => (
            <div key={d.value}>
              <MinimalRadio key={d.value} label={d.label} onClick={() => handleSectionSelect(d)} selected={selectedSections.includes(d.value)} isRadioBtnNotVisible={true} />
            </div>
          ))}
        </div>
      </PopupModal>
    </Drawer>
  )
}

export default TaskList
