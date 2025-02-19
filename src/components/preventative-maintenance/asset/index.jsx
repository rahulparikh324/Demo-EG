import React, { useState } from 'react'

import useFetchData from 'hooks/fetch-data'
import usePostData from 'hooks/post-data'
import { get, isEmpty } from 'lodash'
import enums from 'Constants/enums'

import { camelizeKeys } from 'helpers/formatters'
import { getFormatedDate } from 'helpers/getDateTime'

import SearchComponent from 'components/common/search'
import { TableComponent } from 'components/common/table-components'
import { MinimalButton, ActionButton } from 'components/common/buttons'
import { StatusSelectPopup, StatusComponent } from 'components/common/others'
import { assetPMFilterOptions, getDueInColor } from 'components/preventative-maintenance/common/utils'
import DialogPrompt from 'components/DialogPrompt'

import AddIcon from '@material-ui/icons/Add'
import EditOutlinedIcon from '@material-ui/icons/EditOutlined'
import IconButton from '@material-ui/core/IconButton'
import TablePagination from '@material-ui/core/TablePagination'

import AddPlan from 'components/preventative-maintenance/asset/add-plan'
import ViewPM from 'components/preventative-maintenance/common/view-pm'
import EditAssetPM from 'components/preventative-maintenance/asset/edit-asset-pm'

import preventativeMaintenance from 'Services/preventative-maintenance'
import { Toast } from 'Snackbar/useToast'
import getUserRole from 'helpers/getUserRole'
import moment from 'moment'

const AssetPM = ({ assetDetails }) => {
  const { inspectiontemplateAssetClassId, assetId } = camelizeKeys(assetDetails)
  const [statusFilter, setStatusFilter] = useState(assetPMFilterOptions[0].value)
  const [searchString, setSearchString] = useState('')
  const [loadingId, setLoadingId] = useState('')
  const [loadingStatusId, setLoadingStatusId] = useState('')
  const [viewingId, setViewingId] = useState('')
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false)
  const [isRemovePlanOpen, setIsRemovePlanOpen] = useState(false)
  const [anchorObj, setAnchorObj] = useState({})
  const [isViewPMOpen, setViewPMOpen] = useState(false)
  const [isEditPMOpen, setEditPMOpen] = useState(false)
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [page, setPage] = useState(0)
  const payload = { pagesize: pageSize, pageindex: pageIndex, assetId, searchString, status: statusFilter.filter(d => d !== enums.PM.STATUS.OVERDUE), isRequestedForOverduePm: statusFilter.includes(enums.PM.STATUS.OVERDUE) }
  const { loading, data, reFetch } = useFetchData({ fetch: preventativeMaintenance.asset.getAssignedPMs, payload, formatter: d => get(d, 'data', []), defaultValue: [] })
  const checkUserRole = new getUserRole()
  const columns = [
    { name: 'Title', accessor: 'title', isHidden: false },
    // { name: 'Last Completed Date', render: d => getFormatedDate(d.lastCompletedDate), isHidden: false },
    { name: 'Due Year', render: d => moment(d.lastCompletedDate).format('YYYY'), isHidden: false },
    { name: 'Frequency', accessor: 'frequency', isHidden: false },
    {
      name: 'Due In',
      render: d => {
        if (!d.dueDate && enums.PM.STATUS.COMPLETED !== d.status) return 'NA'
        const d1 = new Date()
        const d2 = new Date(d.dueDate)
        const diffInDays = d.isOverdue ? -1 : Math.ceil(Math.abs(d1 - d2) / (1000 * 60 * 60 * 24))
        const color = enums.PM.STATUS.COMPLETED !== d.status ? getDueInColor(diffInDays) : '#37d482'
        const label = enums.PM.STATUS.COMPLETED !== d.status ? d.dueIn : 'Completed'
        if (enums.PM.STATUS.COMPLETED === d.status) return ''
        if (!color) return 'NA'
        return <StatusComponent color={color} label={label} size='small' filled />
      },
      isHidden: false,
    },
    {
      name: 'Action',
      render: d => (
        <div className='d-flex align-items-center'>
          <ActionButton
            isLoading={loadingStatusId === d.assetPmId}
            tooltip={d.isAssetpmEnabled === true ? 'Make Inactive' : 'Make Active'}
            action={e => {
              e.stopPropagation()
              handleUpdatPMsStatus(d)
              setLoadingStatusId(d.assetPmId)
            }}
            icon={<IconButton size='small' style={{ background: d.isAssetpmEnabled === true ? enums.USER_STATUS_CHIPS[0].color : enums.USER_STATUS_CHIPS[1].color, width: '13px', height: '13px' }} />}
          />
          <ActionButton hide={enums.PM.STATUS.COMPLETED === d.status || d.isCurrentAssetpm === false} isLoading={loadingId === d.assetPmId} tooltip='EDIT' action={e => onEdit(e, d)} icon={<EditOutlinedIcon fontSize='small' />} />
          <ActionButton hide={viewingId !== d.assetPmId} isLoading={viewingId === d.assetPmId} />
        </div>
      ),
      isHidden: checkUserRole.isExecutive() ? true : false,
    },
  ]

  const { mutate: updatePMsStatus } = usePostData({ executer: preventativeMaintenance.asset.assetPMsStatus, postSuccess: () => (reFetch(), setLoadingStatusId('')), message: { success: 'PMs Status Update successfully !', error: 'Something went wrong !' } })

  const handleUpdatPMsStatus = data => updatePMsStatus({ assetPmId: data.assetPmId, isAssetpmEnabled: data.isAssetpmEnabled === true ? false : true })

  const onEdit = async (e, { assetPmId: id }) => {
    e.stopPropagation()
    setLoadingId(id)
    const dataFetched = await fetchPM(id)
    setLoadingId('')
    if (dataFetched) setEditPMOpen(true)
  }
  const removePlan = async () => {
    setLoadingId('PLAN')

    try {
      const res = await preventativeMaintenance.asset.removePM({ id: data.list[0].assetPmPlanId })
      if (res.success > 0) Toast.success(`Plan removed successfully !`)
      else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error removing plan. Please try again !`)
    }
    setLoadingId('')
    setIsRemovePlanOpen(false)
    reFetch()
  }
  const onView = async ({ assetPmId: id }) => {
    setViewingId(id)
    const dataFetched = await fetchPM(id)
    setViewingId('')
    if (dataFetched) setViewPMOpen(true)
  }
  const fetchPM = async id => {
    try {
      const res = await preventativeMaintenance.asset.getPM({ id })
      if (res.success > 0) {
        setAnchorObj(res.data)
        //console.log(res.data)
        return true
      } else throw new Error()
    } catch (error) {
      Toast.error(`Error fetching PM. Please try again !`)
      return false
    }
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
  return (
    <div style={{ height: 'calc(100% - 42px)', padding: '10px', minHeight: '400px' }}>
      <div className='d-flex justify-content-between align-items-center mb-2' style={{ width: '100%' }}>
        <div className='d-flex align-items-center'>
          <StatusSelectPopup options={assetPMFilterOptions} statusFilterValues={statusFilter} onChange={d => setStatusFilter(d)} style={{ marginRight: '10px' }} controlClassName='xs-button' />
          {checkUserRole.isExecutive() ? (
            ''
          ) : isEmpty(data) ? (
            statusFilter[0] !== enums.PM.STATUS.COMPLETED && <MinimalButton onClick={() => setIsAddPlanOpen(true)} text='Add Plan' startIcon={<AddIcon fontSize='small' />} variant='contained' color='primary' baseClassName='xs-button' />
          ) : (
            <MinimalButton onClick={() => setIsRemovePlanOpen(true)} disabled={statusFilter[0] === 15} text='Remove Plan' variant='contained' color='default' baseClassName='xs-button' />
          )}
        </div>
        <SearchComponent placeholder='Search PMs' setSearchString={setSearchString} />
      </div>
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100% - 35px)' }}>
        <TableComponent loading={loading} columns={columns.filter(e => e.isHidden === false)} data={get(data, 'list', [])} onRowClick={d => onView(d)} isForViewAction={true} />
      </div>
      <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={get(data, 'listsize', 0)} rowsPerPage={pageSize} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />
      {isAddPlanOpen && <AddPlan assetId={assetId} id={inspectiontemplateAssetClassId} open={isAddPlanOpen} afterSubmit={reFetch} onClose={() => setIsAddPlanOpen(false)} />}
      <DialogPrompt title='Remove Plan' text='Are you sure you want to remove this plan ?' actionLoader={loadingId === 'PLAN'} open={isRemovePlanOpen} ctaText='Remove' action={removePlan} handleClose={() => setIsRemovePlanOpen(false)} />
      {isViewPMOpen && <ViewPM open={isViewPMOpen} onClose={() => setViewPMOpen(false)} obj={anchorObj} isAssetPM />}
      {isEditPMOpen && <EditAssetPM obj={anchorObj} open={isEditPMOpen} afterSubmit={reFetch} onClose={() => setEditPMOpen(false)} />}
    </div>
  )
}
export default AssetPM
