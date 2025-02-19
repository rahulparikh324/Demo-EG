import React, { useState, useEffect } from 'react'
import enums from 'Constants/enums'

import Drawer from '@material-ui/core/Drawer'
import { FormTitle } from 'components/Maintainance/components'
import { TableComponent } from 'components/common/table-components'
import SearchComponent from 'components/common/search'
import { ActionButton } from 'components/common/buttons'

import { inspectionTypes } from 'components/WorkOrders/maintenance-forms/utils'
import { isEmpty, get, orderBy } from 'lodash'
import useFetchData from 'hooks/fetch-data'
import { Toast } from 'Snackbar/useToast'
import { camelizeKeys } from 'helpers/formatters'

import getFormJson from 'Services/FormIO/get-form-json'
import onBoardingWorkorder from 'Services/WorkOrder/on-boarding-wo'
import assetClass from 'Services/WorkOrder/asset-class'
import preventativeMaintenance from 'Services/preventative-maintenance'

import Repair from 'components/WorkOrders/maintenance-forms/repair'
import ReviewInspection from 'components/WorkOrders/maintenance-forms/review-inspection'
import Edit from 'components/WorkOrders/onboarding/edit'
import EditForm from 'components/preventative-maintenance/forms/edit-form'
import ThermographyForm from 'components/preventative-maintenance/forms/thermography-form'
import Install from 'components/WorkOrders/maintenance-forms/install'

const ReviewLines = ({ open, onClose, data = [], workOrderID, afterSubmit, equipmentListOptions }) => {
  const [selectedRowObj, setSelectedRowObj] = useState({})
  const [searchString, setSearchString] = useState('')
  const [rows, setRows] = useState([])
  const [loadingId, setLoadingId] = useState()
  const [openInspectionType, setOpenInspectionType] = useState('')
  const [anchorObj, setAnchorObj] = useState({})
  const [lineObj, setLineObj] = useState({})
  const [rowsToBeRemoved, setRowsToBeRemoved] = useState([])
  const [pmInspectionType, setPmInspectionType] = useState(0)
  const sortClassCodes = d => {
    const list = get(d, 'data', {})
    list.forEach(d => {
      d.id = d.value
      d.value = d.className
    })
    const sortedList = orderBy(list, [d => d.label && d.label.toLowerCase()], 'asc')
    return sortedList
  }
  const { data: classCodeOptions } = useFetchData({ fetch: assetClass.getAllAssetClassCodes, formatter: d => sortClassCodes(d) })
  //
  useEffect(() => {
    if (!isEmpty(data)) {
      let dataPostFilter = [...data].filter(d => d.statusId === enums.woTaskStatus.ReadyForReview).filter(d => !rowsToBeRemoved.includes(d.woInspectionsTemplateFormIoAssignmentId))
      if (!isEmpty(searchString)) dataPostFilter = dataPostFilter.filter(x => (x.assignedAssetName !== null && x.assignedAssetName.toLowerCase().includes(searchString.toLowerCase())) || (x.assetClassName !== null && x.assetClassName.toLowerCase().includes(searchString.toLowerCase())))
      setRows(dataPostFilter)
      if (!isEmpty(dataPostFilter)) handleRowClick(dataPostFilter[0])
      else {
        if (!isEmpty(rowsToBeRemoved)) handleClose()
      }
    }
  }, [searchString, rowsToBeRemoved, data])
  //
  const handleRowClick = async data => {
    setLoadingId(data['woInspectionsTemplateFormIoAssignmentId'])
    setSelectedRowObj(data['woInspectionsTemplateFormIoAssignmentId'])
    const isInspection = enums.MWO_INSPECTION_TYPES.INSPECTION === data.inspectionType
    const isOb = enums.MWO_INSPECTION_TYPES.ONBOARDING === data.inspectionType
    const isPM = enums.MWO_INSPECTION_TYPES.PM === data.inspectionType
    const formData = isInspection ? await fetchFormJSON(data) : isPM ? await fetchPmFormJSON(data) : await fetchObData(data)
    if (isPM) setPmInspectionType(data.pmInspectionTypeId === 1 ? 1 : 0)
    isInspection ? setAnchorObj(formData) : isOb ? setAnchorObj(formData.data) : isPM ? setAnchorObj({ ...data, ...formData, obj: data }) : setAnchorObj({ assetId: formData.data.mwoAssetId, form_data: formData })
    setLineObj(data)
    setOpenInspectionType(data.inspectionType)
    setLoadingId('')
  }

  const fetchFormJSON = async ({ assetFormId: asset_form_id, formId: form_id }) => {
    try {
      const res = await getFormJson({ form_id, asset_form_id })
      if (res.success) {
        const formDataWithExpaned = res.data.asset_form_data.replaceAll(`"collapsed":true`, `"collapsed":false`)
        return JSON.parse(formDataWithExpaned)
      } else return null
    } catch (error) {
      console.log(error)
      return null
    }
  }
  const fetchObData = async ({ woonboardingassetsId }) => {
    try {
      const res = await onBoardingWorkorder.getAssetDetail({ id: woonboardingassetsId })
      if (res.success) return res
      else return null
    } catch (error) {
      console.log(error)
      return null
    }
  }
  const fetchPmFormJSON = async ({ assetPmId, woonboardingassetsId, tempAssetPmId }) => {
    try {
      const res = await preventativeMaintenance.forms.getLine({ assetPmId, woonboardingassetsId, tempAssetPmId })
      if (res.success > 0) {
        const data = JSON.parse(get(res.data, 'formJson', '{}'))
        const submissionData = JSON.parse(get(res.data, 'pmFormOutputData', '{}'))
        return { data, submissionData }
      } else {
        Toast.error(res.message || 'Error fetching info. Please try again !')
        return {}
      }
    } catch (error) {
      console.log(error)
      Toast.error('Error fetching info. Please try again !')
      return {}
    }
  }
  const afterDataSubmit = data => {
    const toBeRemoved = [...rowsToBeRemoved, data.woInspectionsTemplateFormIoAssignmentId]
    setRowsToBeRemoved(toBeRemoved)
  }
  const handleClose = () => {
    afterSubmit()
    onClose()
  }
  //
  const renderInspectionType = (text, x) => {
    const type = inspectionTypes.find(d => d.value === text)
    if (isEmpty(type)) return <div className='d-flex align-items-center py-1'>N/A</div>
    if (type.value === enums.MWO_INSPECTION_TYPES.PM) return <div className='d-flex align-items-center py-1'>{get(x, 'assetPmTitle', 'N/A')}</div>
    return <div className='d-flex align-items-center py-1'>{type.label}</div>
  }
  const columns = [
    { name: 'Identification', accessor: 'assignedAssetName' },
    { name: 'Asset Class', accessor: 'assetClassName' },
    { name: 'Category', render: d => renderInspectionType(d.inspectionType, d) },
    {
      name: '',
      render: d => (
        <div className='d-flex align-items-center'>
          <ActionButton isLoading={loadingId === d.woInspectionsTemplateFormIoAssignmentId} tooltip='' hide={isEmpty(loadingId)} />
        </div>
      ),
    },
  ]
  return (
    <Drawer anchor='right' open={open} onClose={handleClose}>
      <FormTitle title='Review' closeFunc={handleClose} style={{ width: '100%', minWidth: '450px' }} />
      <div style={{ height: 'calc(100vh - 64px)', padding: '18px 16px', width: '80vw' }}>
        <div className='d-flex flex-row-reverse align-items-center'>
          <SearchComponent searchString={searchString} setSearchString={setSearchString} />
        </div>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: `80%`, marginTop: '10px' }}>
          <TableComponent columns={columns} data={rows} onRowClick={handleRowClick} selectedRow={selectedRowObj} isForViewAction={true} setSelectedRow={setSelectedRowObj} selectedRowKey='woInspectionsTemplateFormIoAssignmentId' enabledRowSelection rowStyle={{ cursor: 'pointer' }} />
        </div>
      </div>
      {[enums.MWO_INSPECTION_TYPES.REPAIR, enums.MWO_INSPECTION_TYPES.REPLACE, enums.MWO_INSPECTION_TYPES.TROUBLE_CALL_CHECK].includes(openInspectionType) && (
        <Repair
          isRepair={enums.MWO_INSPECTION_TYPES.REPAIR === openInspectionType}
          isReplace={enums.MWO_INSPECTION_TYPES.REPLACE === openInspectionType}
          isTroblecall={enums.MWO_INSPECTION_TYPES.TROUBLE_CALL_CHECK === openInspectionType}
          workOrderID={workOrderID}
          isEdit={true}
          obj={anchorObj}
          open={[enums.MWO_INSPECTION_TYPES.REPAIR, enums.MWO_INSPECTION_TYPES.REPLACE, enums.MWO_INSPECTION_TYPES.TROUBLE_CALL_CHECK].includes(openInspectionType)}
          onClose={() => setOpenInspectionType('')}
          isInReview={true}
          lineObj={lineObj}
          afterSubmit={afterDataSubmit}
        />
      )}
      {enums.MWO_INSPECTION_TYPES.INSPECTION === openInspectionType && <ReviewInspection data={lineObj} equipmentListOptions={equipmentListOptions} open={enums.MWO_INSPECTION_TYPES.INSPECTION === openInspectionType} afterSubmit={afterDataSubmit} onClose={() => setOpenInspectionType('')} obj={anchorObj} />}
      {enums.MWO_INSPECTION_TYPES.ONBOARDING === openInspectionType && (
        <Install isOnboarding={true} viewObj={anchorObj} open={enums.MWO_INSPECTION_TYPES.ONBOARDING === openInspectionType} onClose={() => setOpenInspectionType('')} afterSubmit={afterDataSubmit} classCodeOptions={classCodeOptions} workOrderID={workOrderID} lineObj={lineObj} isInReview={true} isInstalling />
      )}
      {enums.MWO_INSPECTION_TYPES.PM === openInspectionType && pmInspectionType === 0 && <EditForm data={anchorObj.data} open={enums.MWO_INSPECTION_TYPES.PM === openInspectionType && pmInspectionType === 0} onClose={() => setOpenInspectionType('')} afterSubmit={afterDataSubmit} submisson={anchorObj.submissionData} obj={anchorObj} isInReview />}
      {enums.MWO_INSPECTION_TYPES.PM === openInspectionType && pmInspectionType === 1 && <ThermographyForm open={enums.MWO_INSPECTION_TYPES.PM === openInspectionType && pmInspectionType === 1} onClose={() => setOpenInspectionType('')} submisson={anchorObj.submissionData} obj={camelizeKeys(anchorObj.obj)} afterSubmit={afterDataSubmit} isInReview />}
    </Drawer>
  )
}

export default ReviewLines
