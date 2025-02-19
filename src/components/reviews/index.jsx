import React, { useState, useEffect, useRef } from 'react'
import useFetchData from 'hooks/fetch-data'
import usePostData from 'hooks/post-data'

import equipments from 'Services/equipments'
import asset from 'Services/assets'
import onBoardingWorkorder from 'Services/WorkOrder/on-boarding-wo'
import preventativeMaintenance from 'Services/preventative-maintenance'

import SearchComponent from 'components/common/search'
import { StatusComponent, Menu, PopupModal, MinimalCheckbox } from 'components/common/others'
import { TableComponent } from 'components/common/table-components'
import ViewForm from 'components/preventative-maintenance/forms/view-form'
import ViewOB from 'components/WorkOrders/onboarding/view'
import View from 'components/WorkOrders/maintenance-forms/view'
import ViewIssue from 'components/WorkOrders/maintenance-forms/multi-step-forms/issue/view'
// import View from 'components/WorkOrders/onboarding/view'
import { RenderCheckBox } from 'components/WorkOrders/issues/utils'

import ThermographyForm from 'components/preventative-maintenance/forms/thermography-form'
import WOCategoryView from 'components/WorkOrders/WOCategoryView'
import { MinimalTextArea } from 'components/Assets/components'
import { MinimalAutoComplete } from 'components/Assets/components'
import { MinimalButton, MinimalCircularButtonGroup, ActionButton } from 'components/common/buttons'

import TablePagination from '@material-ui/core/TablePagination'
import Checkbox from '@material-ui/core/Checkbox'
import DoneIcon from '@material-ui/icons/Done'
import Tooltip from '@material-ui/core/Tooltip'
import CheckCircleOutlineOutlined from '@material-ui/icons/CheckCircleOutlineOutlined'
import CircularProgress from '@material-ui/core/CircularProgress'
import FindInPageOutlinedIcon from '@material-ui/icons/FindInPageOutlined'

import getUserRole from 'helpers/getUserRole'
import { camelizeKeys } from 'helpers/formatters'

import enums from 'Constants/enums'
import { get, isEmpty } from 'lodash'
import { Toast } from 'Snackbar/useToast'
import { getApplicationStorageItem } from 'helpers/getStorageItem'

const Reviews = ({ woType, reFetch: countReFetch }) => {
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [page, setPage] = useState(0)
  const [searchString, setSearchString] = useState('')
  const [rowLoading, setRowLoading] = useState(false)
  const [isViewRepairObOpen, setIsViewRepairObOpen] = useState(false)
  const [isViewRepairOpen, setIsViewRepairOpen] = useState(false)
  const [anchorObj, setAnchorObj] = useState({})
  const [isViewThermographyOpen, setViewThermographyOpen] = useState(false)
  const [isViewPmOpen, setViewPmOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [fetchingForm, setFetchingForm] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [rejectLoading, setRejectLoading] = useState(false)
  const defaultStatus = enums.WO_STATUS.find(e => e.value === enums.woTaskStatus.ReadyForReview)
  const [status, setStatus] = useState([defaultStatus])
  const isFirstRender = useRef(true)

  const checkUserRole = new getUserRole()

  const [selected, setSelected] = useState([])
  const [isAllSelected, setAllSelected] = useState(false)
  const [currentMenuStatus, setCurrentMenuStatus] = useState(enums.woTaskStatus.ReadyForReview)
  const showCheckBox = currentMenuStatus === enums.woTaskStatus.ReadyForReview || currentMenuStatus === enums.woTaskStatus.Complete

  const {
    initialLoading,
    data: inspectionData,
    reFetch,
  } = useFetchData({
    fetch: asset.inspections.maintenance,
    payload: { pageIndex, pageSize, assetId: null, searchString: searchString, woType: woType, status: !isEmpty(status) ? status?.map(d => d.value) : [], isRequestedForNotCompletedWosWoline: currentMenuStatus === enums.woTaskStatus.ReadyForReview || currentMenuStatus === enums.woTaskStatus.Complete ? true : false },
    formatter: d => get(d, 'data', []),
  })
  const { data: equipmentListOptions } = useFetchData({ fetch: equipments.getAllEquipmentList, payload: { pageSize: 0, pageIndex: 0, siteId: localStorage.getItem('siteId'), searchString: '', equipmentNumber: [], manufacturer: [], modelNumber: [], calibrationStatus: [] }, formatter: d => get(d, 'data.list', []) })
  const woTypeName = get(inspectionData, 'list', []).map(d => d.woType)
  const isAcceptanceWO = woTypeName === enums.woType.Acceptance

  const viewInspectionForm = () => {
    setIsViewOpen(true)
  }

  const fetchPmFormJSON = async obj => {
    try {
      setFetchingForm(obj.wo_inspectionsTemplateFormIOAssignment_id)
      const res = await preventativeMaintenance.forms.getLine({ assetPmId: get(obj, 'assetPmId', null), tempAssetPmId: get(obj, 'tempAssetPmId', null), woonboardingassetsId: obj.woonboardingassetsId })
      if (obj.pmInspectionTypeId === 1) {
        const submissionData = JSON.parse(get(res.data, 'pmFormOutputData', '{}'))
        return { submissionData }
      } else if (res.success > 0) {
        const data = JSON.parse(get(res.data, 'formJson', '{}'))
        const submissionData = JSON.parse(get(res.data, 'pmFormOutputData', '{}'))
        return { data, submissionData }
      } else Toast.error(res.message || 'Error fetching info. Please try again !')
    } catch (error) {
      console.log(error)
      Toast.error('Error fetching info. Please try again !')
      setFetchingForm(false)
    }
  }

  const fetchFormJSON = async (type, obj) => {
    // console.log(obj)
    const isRepairReplace = [enums.MWO_INSPECTION_TYPES.REPAIR, enums.MWO_INSPECTION_TYPES.REPLACE, enums.MWO_INSPECTION_TYPES.TROUBLE_CALL_CHECK, enums.MWO_INSPECTION_TYPES.INSTALL].includes(obj.inspectionType)
    setFetchingForm(obj.woonboardingassetsId)
    try {
      setRowLoading(true)
      const formData = isRepairReplace ? await onBoardingWorkorder.getAssetDetail({ id: obj.woonboardingassetsId }) : obj.inspectionType === enums.MWO_INSPECTION_TYPES.PM ? await fetchPmFormJSON(obj) : await onBoardingWorkorder.getAssetDetail({ id: obj.woonboardingassetsId })
      const anchor = isAcceptanceWO || obj.inspectionType === enums.MWO_INSPECTION_TYPES.INSPECTION ? { ...obj, formData } : obj.inspectionType === enums.MWO_INSPECTION_TYPES.INSTALL ? { ...obj, ...formData.data } : { ...obj, formData }
      setAnchorObj(anchor)
      setRowLoading(false)
      if (type === 'VIEW') {
        if (isRepairReplace) {
          if (obj.inspectionType === enums.MWO_INSPECTION_TYPES.INSTALL) {
            setIsViewRepairObOpen(true)
          } else setIsViewRepairOpen(true)
        } else if (obj.inspectionType === enums.MWO_INSPECTION_TYPES.PM) {
          if (!isEmpty(formData)) {
            setAnchorObj({ ...formData, obj })
            obj.pmInspectionTypeId === 1 ? setViewThermographyOpen(true) : setViewPmOpen(true)
          }
        } else viewInspectionForm()
      }
    } catch (error) {
      console.log(error)
    }
  }

  const selectAndDeSelectAll = () => {
    const listIds = new Set(get(inspectionData, 'list', []).map(d => d.woonboardingassetsId))

    if (!isAllSelected) {
      setSelected(prevSelected => {
        const prevSelectedSet = new Set(prevSelected)
        listIds.forEach(id => prevSelectedSet.add(id))
        return Array.from(prevSelectedSet)
      })
    } else {
      setSelected(prevSelected => prevSelected.filter(id => !listIds.has(id)))
    }
    setAllSelected(prev => !prev)
  }

  // console.log(anchorObj)
  const columns = [
    {
      name: (!checkUserRole.isCompanyAdmin() && currentMenuStatus === enums.woTaskStatus.Complete) || (showCheckBox && <MinimalCheckbox style={{ marginLeft: '3px' }} selected={isAllSelected} onClick={selectAndDeSelectAll} />),
      render: d => (!checkUserRole.isCompanyAdmin() && currentMenuStatus === enums.woTaskStatus.Complete) || (showCheckBox && <RenderCheckBox data={d} accessor='woonboardingassetsId' selected={selected} handleChange={handleCheckBoxChange} />),
    },
    {
      name: 'Asset Name',
      render: d => <>{d.assetName}</>,
    },
    { name: 'Work Order', accessor: 'manualWoNumber' },
    {
      name: 'Inspected At',
      render: d => {
        if (!d.inspectedAt) return '-'
        return `${get(d, 'inspectedAt', '')?.slice(5, 7)}-${get(d, 'inspectedAt', '')?.slice(8, 10)}-${get(d, 'inspectedAt', '')?.slice(0, 4)}`
      },
    },
    { name: 'Room', accessor: 'room' },
    { name: 'Class Code', accessor: 'assetClassCode' },
    {
      name: 'Status',
      render: val => {
        const { color, label } = enums.WO_STATUS.find(d => d.value === val.status)
        return <StatusComponent color={color} label={label} size='small' />
      },
    },
    {
      name: 'Action',
      render: d => (
        <div className='d-flex align-items-center'>
          <Menu options={menuOptions} data={d} width={165} loading={rowLoading && fetchingForm === d.woonboardingassetsId} />
        </div>
      ),
    },
  ]

  const handleCheckBoxChange = list => {
    let updatedMarkedRows

    if (selected.includes(list.woonboardingassetsId)) {
      setSelected(p => p.filter(d => d !== list.woonboardingassetsId))
      updatedMarkedRows = selected.filter(d => d !== list.woonboardingassetsId)
    } else {
      setSelected(p => [...p, list.woonboardingassetsId])
      updatedMarkedRows = [...selected, list.woonboardingassetsId]
    }

    if (updatedMarkedRows.length === 0) {
      setAllSelected(false)
    } else if (get(inspectionData, 'list', []).every(d => updatedMarkedRows.includes(d.woonboardingassetsId))) {
      setAllSelected(true)
    } else {
      setAllSelected(false)
    }
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (get(inspectionData, 'list', []).every(d => selected.includes(d.woonboardingassetsId))) {
      setAllSelected(true)
    } else {
      setAllSelected(false)
    }
  }, [page, selected, inspectionData])

  const rejectAssetAction = request => {
    setIsRejectOpen(true)
    setAnchorObj(request)
    return
  }

  const rejectAsset = async () => {
    setFetchingForm(anchorObj.woonboardingassetsId)
    const payload = { woonboardingassets_id: anchorObj.woonboardingassetsId, task_rejected_notes: reason, status: enums.woTaskStatus.Reject }
    setRejectLoading(true)
    try {
      const res = await onBoardingWorkorder.updateAssetStatus(payload)
      if (res.success > 0) {
        setSelected([])
        Toast.success(`Line Rejected Successfully !`)
      } else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error rejecting line. Please try again !`)
    }
    setRejectLoading(false)
    setIsRejectOpen(false)
    reFetch()
    countReFetch()
    setReason('')
  }

  const handleAction = async (type, obj) => {
    if (type === 'VIEW') fetchFormJSON('VIEW', obj)
    if (type === 'ACCEPT') await updateViewTaskStatus(obj, enums.woTaskStatus.Complete)
    if (type === 'REJECT') rejectAssetAction(obj)
    if (type === 'READY_FOR_REVIEW') await changeStatus(obj, enums.woTaskStatus.ReadyForReview)
  }

  const updateViewTaskStatus = async (request, status) => {
    setFetchingForm(request.woonboardingassetsId)
    try {
      setRowLoading(true)
      let payload = {
        woonboardingassets_id: request.woonboardingassetsId,
        status: status,
      }
      const res = await onBoardingWorkorder.updateAssetStatus(payload)
      if (res.success === 1) {
        setRowLoading(false)
        reFetch()
        countReFetch()
        setSelected([])
        Toast.success('Status updated successfully!')
      } else {
        setRowLoading(false)
        Toast.error(res.message)
      }
    } catch (error) {
      Toast.error('Something went wrong !')
      setRowLoading(false)
    }
  }
  const changeStatus = async (data, status) => {
    setFetchingForm(data.woonboardingassetsId)
    try {
      setRowLoading(true)
      let payload = {
        woonboardingassets_id: data.woonboardingassetsId,
        status: status,
      }
      const res = await onBoardingWorkorder.updateAssetStatus(payload)
      setRowLoading(false)
      if (res.success === 1) {
        reFetch()
        countReFetch()
        Toast.success('Status updated successfully!')
        setSelected([])
      } else Toast.error(res.message)
    } catch (error) {
      Toast.error('Something went wrong !')
      setRowLoading(false)
    }
  }
  const checkDisabled = d => {
    if (!checkUserRole.isCompanyAdmin()) return true
    // if (d.status !== enums.woTaskStatus.Complete && d.status !== enums.woTaskStatus.Submitted) return true
    if (d.workOrderStatus === enums.woTaskStatus.Complete) return true
    else return false
  }
  const menuOptions = [
    { id: 2, name: 'Accept', action: d => handleAction('ACCEPT', d), disabled: d => d.status !== enums.woTaskStatus.ReadyForReview || d.workOrderStatus === enums.woTaskStatus.Complete },
    { id: 3, name: 'Reject', action: d => handleAction('REJECT', d), disabled: d => d.status !== enums.woTaskStatus.ReadyForReview || d.workOrderStatus === enums.woTaskStatus.Complete },
    { id: 6, name: 'Ready For Review', action: d => handleAction('READY_FOR_REVIEW', d), disabled: d => checkDisabled(d) },
  ]

  const postSearch = () => {
    setPage(0)
    setPageIndex(1)
  }

  const handleChangePage = (e, newPage) => {
    setPage(newPage)
    setPageIndex(newPage + 1)
  }

  const handleChangeRowsPerPage = event => {
    setPageSize(parseInt(event.target.value, 10))
    setPage(0)
    setPageIndex(1)
  }
  const closeView = () => {
    setIsViewOpen(false)
    reFetch()
  }
  const closeRejectReasonModal = () => {
    setReason('')
    setIsRejectOpen(false)
  }

  const postSuccess = () => {
    reFetch()
    setSelected([])
    countReFetch()
  }

  const { loading: statusChangeLoading, mutate: updateStatus } = usePostData({ executer: asset.inspections.updateOBWOStatus, postSuccess, message: { success: 'Status updated successfully !', error: 'Something went wrong !' } })
  const handleChangeStatus = () => updateStatus({ woonboardingassetsIdList: selected, status: status[0].value === enums.woTaskStatus.ReadyForReview ? enums.woTaskStatus.Complete : enums.woTaskStatus.ReadyForReview })

  const buttonTypeOption = [
    { label: 'All', value: 0 },
    { label: 'Ready For Review', value: enums.woTaskStatus.ReadyForReview },
    { label: 'Completed', value: enums.woTaskStatus.Complete },
  ]

  const handleStatusChange = status => {
    if (!isEmpty(enums.WO_STATUS.find(e => e.value === status))) {
      setStatus([enums.WO_STATUS.find(e => e.value === status)])
    } else {
      setStatus([])
    }
    setSelected([])
    setCurrentMenuStatus(status)
    setAllSelected(false)
  }

  return (
    <div style={{ paddingTop: woType === enums.WO_TYPE_LIST[1].value ? '14px 0 0 0' : 0 }}>
      <div className='d-flex  justify-content-between align-items-center mb-2'>
        <div className='d-flex align-items-center'>
          <MinimalCircularButtonGroup value={currentMenuStatus} onChange={value => handleStatusChange(value)} options={buttonTypeOption} baseStyles={{ marginLeft: '10px' }} />
          {selected.length >= 1 && (
            <div className='mx-2'>
              {/* {currentMenuStatus === enums.woTaskStatus.ReadyForReview && <ActionButton icon={<CheckCircleOutlineOutlined size='small' />} tooltipPlacement='bottom' tooltip='Mark Completed' action={handleChangeStatus} />} */}
              {currentMenuStatus === enums.woTaskStatus.ReadyForReview && (
                <MinimalButton onClick={handleChangeStatus} text='Mark Completed' size='small' startIcon={<CheckCircleOutlineOutlined fontSize='small' />} variant='contained' color='primary' baseClassName='nf-buttons' style={{ marginRight: '10px' }} disabled={statusChangeLoading} loading={statusChangeLoading} loadingText='Mark Completed' />
              )}
              {currentMenuStatus === enums.woTaskStatus.Complete && (
                <MinimalButton
                  onClick={handleChangeStatus}
                  text='Mark Ready For Review'
                  size='small'
                  startIcon={<FindInPageOutlinedIcon fontSize='small' />}
                  variant='contained'
                  color='primary'
                  baseClassName='nf-buttons'
                  style={{ marginRight: '10px' }}
                  disabled={statusChangeLoading}
                  loading={statusChangeLoading}
                  loadingText='Mark Ready For Review'
                />
              )}
              {/* {currentMenuStatus === enums.woTaskStatus.Complete && <ActionButton icon={<FindInPageOutlinedIcon size='small' />} tooltipPlacement='bottom' tooltip='Mark Ready For Review' action={handleChangeStatus} />} */}
              {/* {true && <CircularProgress size={15} thickness={5} style={{ margin: '10px 10px 0 10px' }} />} */}
            </div>
          )}
        </div>
        <SearchComponent postClear={postSearch} postSearch={postSearch} searchString={searchString} setSearchString={setSearchString} />
      </div>
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100vh - 275px)' }}>
        <TableComponent loading={initialLoading} columns={columns} data={get(inspectionData, 'list', [])} onRowClick={d => handleAction('VIEW', d)} isForViewAction={true} />
      </div>
      {!isEmpty(get(inspectionData, 'list', [])) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={get(inspectionData, 'listsize', 0)} rowsPerPage={pageSize} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
      {isViewRepairObOpen && <ViewOB viewObj={camelizeKeys(anchorObj)} open={isViewRepairObOpen} onClose={() => setIsViewRepairObOpen(false)} isOnboarding={camelizeKeys(anchorObj.woType) !== enums.woType.InfraredScan} />}
      {/* {isViewRepairOpen && <View obj={anchorObj} open={isViewRepairOpen} onClose={() => setIsViewRepairOpen(false)} />} */}
      {isViewRepairOpen && <ViewIssue open={isViewRepairOpen} onClose={() => setIsViewRepairOpen(false)} woOBAssetID={get(anchorObj, 'woonboardingassetsId')} />}
      {/* {isViewOpen && <View isOnboarding={isOnboarding} viewObj={actionObj} open={isViewOpen} onClose={() => setIsViewOpen(false)} />} */}

      {isViewThermographyOpen && <ThermographyForm isView open={isViewThermographyOpen} onClose={() => setViewThermographyOpen(false)} submisson={anchorObj.submissionData} obj={camelizeKeys(anchorObj.obj)} />}
      {isViewPmOpen && <ViewForm isView open={isViewPmOpen} onClose={() => setViewPmOpen(false)} data={anchorObj} submisson={anchorObj.submissionData} obj={camelizeKeys(anchorObj)} />}
      {isViewOpen && <WOCategoryView equipmentListOptions={equipmentListOptions} open={isViewOpen} onClose={() => closeView()} obj={anchorObj} />}
      {isRejectOpen && (
        <PopupModal open={isRejectOpen} onClose={closeRejectReasonModal} title='Reject Asset' loading={rejectLoading} handleSubmit={rejectAsset}>
          <MinimalTextArea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder='Please enter review notes here..' w={100} />
        </PopupModal>
      )}
    </div>
  )
}

export default Reviews
