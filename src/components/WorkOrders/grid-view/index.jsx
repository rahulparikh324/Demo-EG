import React, { useState, useRef, useEffect, useCallback } from 'react'
import enums from 'Constants/enums'
import { useDeepCompareEffect } from 'react-use'

import Drawer from '@material-ui/core/Drawer'
import ReactDataGrid from '@inovua/reactdatagrid-enterprise'
import '@inovua/reactdatagrid-enterprise/index.css'

import './style.css'

import { FormTitle } from 'components/Maintainance/components'
import useFetchData from 'hooks/fetch-data'
import { isEmpty, get } from 'lodash'
import { ActionButton } from 'components/common/buttons'

import getWOGridView from 'Services/WorkOrder/getWOGridView'
import updateWOCategoryTaskStatus from 'Services/WorkOrder/updateWOCategoryTaskStatus'

import IconButton from '@material-ui/core/IconButton'
import CheckIcon from '@material-ui/icons/Check'
import NotInterestedIcon from '@material-ui/icons/NotInterested'
import PauseCircleOutlineIcon from '@material-ui/icons/PauseCircleOutline'
import CircularProgress from '@material-ui/core/CircularProgress'
import Button from '@material-ui/core/Button'
import ReactExport from 'react-data-export'

import RejectCategoryTask from '../RejectCategoryTask'
import { Toast } from 'Snackbar/useToast'

import { gridDataFormatter } from './utils'
import SaveIcon from '@material-ui/icons/Save'
import CancelIcon from '@material-ui/icons/Cancel'
import addUpdateAssetForm from 'Services/FormIO/addUpdateAssetForm'
import { PopupModal } from 'components/common/others'

const ExcelFile = ReactExport.ExcelFile
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn

function GridView({ open, onClose, obj, afterSubmit, woStatusId }) {
  const { wo_inspectionsTemplateFormIOAssignment_id: categoryID, form_category_name: categoryName, form_data: formData } = obj
  const { loading, data, reFetch } = useFetchData({ fetch: getWOGridView, payload: categoryID, formatter: x => gridDataFormatter(x, woStatusId, handleClose, formData), defaultValue: { columns: [], rows: [], filterValues: [] } })
  const [isRejectReasonModalOpen, setRejectReasonModalOpen] = useState(false)
  const [selectedTaskCategoryMappingId, setSelectedTaskCategoryMappingId] = useState('')
  const [filterValue, setFilterValue] = useState(data.filterValues)
  const gridStyle = { minHeight: `100%`, width: `100%` }
  const [initialLoad, setInitialLoad] = useState(true)
  const outerDiv = useRef(null)
  const [ActualData, setActualData] = useState(data)
  const [isModalOpen, setIsModalOpen] = useState(false)
  //
  const [actionTrigger, setActionTrigger] = useState(0)
  const [oldData, setOldData] = useState([])
  const [actionData, setActionData] = useState({})
  //
  const licenseKey = 'AppName=EgalvanicApp,Company=Egalvanic,ExpiryDate=2024-02-28,LicenseDeveloperCount=1,LicenseType=single_app,Ref=EgalvanicLicenseRef,Z=-19395697961029487382-250693618-209387994118832466431754112796'
  //
  const saveFormData = async row => {
    const { asset_form_id, form_name: asset_form_name, form_type: asset_form_type, asset_form_description, status_id: status, inspection_form_data } = row
    const form_id = obj['form_id']
    const asset_form_data = JSON.stringify({ data: JSON.parse(inspection_form_data) })
    const payload = { asset_form_id, asset_form_name, form_id, asset_form_type, asset_form_description, asset_form_data, status }
    try {
      const res = await addUpdateAssetForm(payload)
      if (res.success > 0) {
        Toast.success(`Form submitted successfully !`)
        return true
      } else {
        Toast.error(res.message)
        return false
      }
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
      return false
    }
  }

  const handleAction = (type, obj) => {
    setActionData({ type, obj })
    setActionTrigger(p => p + 1)
  }

  const updateTaskStatus = async (obj, status) => {
    try {
      const payload = { wOcategorytoTaskMapping_id: obj.wOcategorytoTaskMapping_id, status }
      const res = await updateWOCategoryTaskStatus(payload)
      if (res.success > 0) Toast.success('Status updated successfully!')
      else Toast.error(res.message)
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
    }
    reFetch()
  }

  const handleClose = () => {
    const pendingFields = ActualData.rows.filter(row => row['actions'] === true)
    if (pendingFields.length > 0) setIsModalOpen(true)
    else {
      onClose()
      afterSubmit()
    }
  }

  const handleFilterChange = f => {
    setFilterValue(f)
    outerDiv.current.focus()
  }

  useEffect(() => {
    setActualData(data)
    setOldData(get(ActualData, 'rows', []))
    if (!loading) {
      let columns = get(ActualData, 'columns', [])
      if (!isEmpty(columns)) {
        columns.push({
          name: 'actions',
          header: 'Actions',
          defaultWidth: 100,
          render: row => renderActions(row.data),
          defaultLocked: 'end',
          editable: false,
        })
        setActualData({ ...ActualData, columns })
      }
      if (!initialLoad) ActualData.filterValues = filterValue
      setInitialLoad(false)
    }
  }, [loading, data])

  // edit
  const onEditComplete = useCallback(
    ({ value, columnId, rowIndex: rowId, data: rowData }) => {
      const rows = structuredClone(get(ActualData, 'rows', []))
      const data = [...rows]
      for (let index = 0; index < data.length; index++) {
        if (rowData.wOcategorytoTaskMapping_id === data[index]['wOcategorytoTaskMapping_id']) {
          data[index][columnId] = value
          data[index]['actions'] = true
          let prevInspectionFormData = JSON.parse(data[index].inspection_form_data)
          const groupName = columnId.split('.')[0]
          const fieldName = columnId.split('.')[1]
          prevInspectionFormData[groupName] = { ...prevInspectionFormData[groupName], [fieldName]: value }
          data[index].inspection_form_data = JSON.stringify(prevInspectionFormData)
          break
        }
      }
      setActualData({ ...ActualData, rows: data })
    },
    [ActualData]
  )
  const onEditStart = ({ value, columnId, rowIndex: rowId, data: rowData }) => {
    const rows = [...get(ActualData, 'rows', [])]
    let data = [...rows]
    for (let index = 0; index < data.length; index++) {
      if (rowData.wOcategorytoTaskMapping_id === data[index]['wOcategorytoTaskMapping_id']) {
        data[index]['actions'] = true
        break
      }
    }
    setActualData({ ...ActualData, rows: data })
  }

  //action trigger
  useDeepCompareEffect(() => {
    if (actionData.type === 'DISCARD') discardGridRow(actionData)
    if (actionData.type === 'SAVE') saveGridRow(actionData)
    if (actionData.type === 'ACCEPT') updateTaskStatus(actionData.obj, enums.woTaskStatus.Complete)
    if (actionData.type === 'HOLD') updateTaskStatus(actionData.obj, enums.woTaskStatus.Hold)
    if (actionData.type === 'REJECT') {
      setSelectedTaskCategoryMappingId(actionData.obj.wOcategorytoTaskMapping_id)
      setRejectReasonModalOpen(true)
    }
  }, [actionTrigger])
  //actions
  const getRowData = action => {
    const oldRow = {}
    for (let index = 0; index < oldData.length; index++) {
      if (action.obj.wOcategorytoTaskMapping_id === oldData[index]['wOcategorytoTaskMapping_id']) {
        oldRow.data = oldData[index]
        oldRow.index = index
        break
      }
    }
    return oldRow
  }
  const discardGridRow = action => {
    const oldRow = getRowData(action)
    const rows = [...get(ActualData, 'rows', [])]
    const data = [...rows]
    data[oldRow.index] = oldRow.data
    data[oldRow.index]['actions'] = false
    setActualData({ ...ActualData, rows: data })
    setActionData({})
  }
  const saveGridRow = async action => {
    const isSaved = await saveFormData(action.obj)
    if (isSaved) {
      const oldRow = getRowData(action)
      const rows = [...get(ActualData, 'rows', [])]
      const data = [...rows]
      data[oldRow.index]['actions'] = false
      setActualData({ ...ActualData, rows: data })
      setOldData(get(ActualData, 'rows', []))
      setActionData({})
    }
  }

  // render action
  const renderActions = row => {
    const isHide = woStatusId === 15 || row.status_id !== enums.woTaskStatus.ReadyForReview
    if (row['actions']) {
      return (
        <div className='action-col-data-row'>
          <ActionButton isLoading={row.actionLoading && row.actionType === 'SAVE'} tooltip='SAVE' action={() => handleAction('SAVE', row)} icon={<SaveIcon fontSize='small' style={{ color: '#438C09' }} />} />
          <ActionButton isLoading={row.actionLoading && row.actionType === 'DISCARD'} tooltip='DISCARD' action={() => handleAction('DISCARD', row)} icon={<CancelIcon fontSize='small' style={{ color: '#F44336' }} />} />
        </div>
      )
    }
    return (
      <div className='action-col-data-row'>
        <ActionButton hide={isHide} isLoading={row.actionLoading && row.actionType === 'ACCEPT'} tooltip='ACCEPT' action={() => handleAction('ACCEPT', row)} icon={<CheckIcon fontSize='small' style={{ color: '#438C09' }} />} />
        <ActionButton hide={isHide} isLoading={row.actionLoading && row.actionType === 'REJECT'} tooltip='REJECT' action={() => handleAction('REJECT', row)} icon={<NotInterestedIcon fontSize='small' style={{ color: '#F44336' }} />} />
        <ActionButton hide={isHide} isLoading={row.actionLoading && row.actionType === 'HOLD'} tooltip='HOLD' action={() => handleAction('HOLD', row)} icon={<PauseCircleOutlineIcon fontSize='small' style={{ color: '#FF9D33' }} />} />
      </div>
    )
  }
  return (
    <Drawer anchor='right' open={open} onClose={handleClose}>
      <PopupModal open={isModalOpen} onClose={onClose} title='Do you want to save the changes ?' handleSubmit={() => setIsModalOpen(false)}>
        Your changes will be lost if you dont save them
      </PopupModal>

      <FormTitle title={categoryName} closeFunc={handleClose} style={{ width: '90vw', minWidth: '90vw' }} />
      <div className='p-3 d-flex flex-row-reverse' ref={outerDiv}>
        <ExcelFile
          element={
            <Button size='small' variant='contained' color='primary' className='nf-buttons' disableElevation>
              Export Excel
            </Button>
          }
        >
          {!loading && (
            <ExcelSheet data={data.rows} name='GirdData'>
              {get(data, 'columns', []).map((field, ind) => (
                <ExcelColumn key={ind} label={field.header} value={field.df}></ExcelColumn>
              ))}
            </ExcelSheet>
          )}
        </ExcelFile>
      </div>
      <div className='table-container' style={{ height: '100%', padding: '0 16px 16px 16px', display: 'flex', position: 'relative' }}>
        {loading && <CircularProgress style={{ position: 'absolute', top: '50%', left: '50%' }} size={30} thickness={5} />}
        {!loading && (
          <ReactDataGrid
            licenseKey={licenseKey}
            onFilterValueChange={handleFilterChange}
            onEditComplete={onEditComplete}
            rowHeight={45}
            idProperty='id'
            defaultFilterValue={ActualData.filterValues}
            groups={ActualData.groups}
            columns={ActualData.columns}
            dataSource={ActualData.rows}
            style={gridStyle}
            editable={obj.status_id === enums.woTaskStatus.Complete ? false : true}
            onEditStart={onEditStart}
          />
        )}
      </div>
      {isRejectReasonModalOpen && <RejectCategoryTask woTaskCategoryMappingId={selectedTaskCategoryMappingId} open={isRejectReasonModalOpen} afterSubmit={() => reFetch()} onClose={() => setRejectReasonModalOpen(false)} />}
    </Drawer>
  )
}

export default GridView
