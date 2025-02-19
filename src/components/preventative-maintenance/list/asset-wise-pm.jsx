import React, { useState } from 'react'

import useFetchData from 'hooks/fetch-data'
import { get, isEmpty, has } from 'lodash'
import enums from 'Constants/enums'
import { Toast } from 'Snackbar/useToast'

import { ActionButton, MinimalButton } from 'components/common/buttons'
import { TableHierarchy } from 'components/common/table-hierarchy'
import { StatusComponent, PopupModal, AssetTypeIcon } from 'components/common/others'
import { getDueInColor } from 'components/preventative-maintenance/common/utils'
import { MinimalTextArea } from 'components/Assets/components'
import { pmStatusOptions, getChip } from 'components/preventative-maintenance/common/utils'
import EditAssetPM from 'components/preventative-maintenance/asset/edit-asset-pm'
import ViewPM from 'components/preventative-maintenance/common/view-pm'

import EditOutlinedIcon from '@material-ui/icons/EditOutlined'
import CheckOutlinedIcon from '@material-ui/icons/CheckOutlined'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import TablePagination from '@material-ui/core/TablePagination'

import preventativeMaintenance from 'Services/preventative-maintenance'

const AssetWisePM = ({ searchString, statusFilter }) => {
  const [pageIndex, setPageIndex] = useState(1)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [loadingId, setLoadingId] = useState('')
  const [viewingId, setViewingId] = useState('')
  const [assetWisePMs, setAssetWisePMs] = useState([])
  const [anchorObj, setAnchorObj] = useState({})
  const [isEditPMOpen, setEditPMOpen] = useState(false)
  const [isCompleteOpen, setCompleteOpen] = useState(false)
  const [isViewPMOpen, setViewPMOpen] = useState(false)
  const [completeLoading, setCompleteLoading] = useState(false)
  const [comment, setComment] = useState('')
  const [datalist, setDatalist] = useState([])

  const handleFormatter = data => {
    const list = get(data, 'list', []).map(d => ({
      ...d,
      isExpanded: true,
      assetIcon: d.assetPmsList[0].assetClassType,
    }))
    if (!isEmpty(searchString)) setPage(0)
    setDatalist(list)
    return { ...data, list }
  }

  const payload = { pagesize: rowsPerPage, pageindex: isEmpty(searchString) ? pageIndex : 0, assetId: null, searchString, status: statusFilter.filter(d => d !== enums.PM.STATUS.OVERDUE), IsRequestedForAssign: false, isRequestedForOverduePm: statusFilter.includes(enums.PM.STATUS.OVERDUE) }
  const { loading, data, reFetch } = useFetchData({ fetch: preventativeMaintenance.asset.getAssetWise, payload, formatter: d => handleFormatter(get(d, 'data', {})), defaultValue: [] })
  const assetWiseColumns = [
    {
      name: 'Asset Name',
      render: d => {
        return (
          <div className='d-flex align-items-center'>
            {d.isExpanded ? (
              <ActionButton hide={isEmpty(d.assetPmsList)} action={e => expandCollapseAssetPMs(e, d)} tooltip='COLLAPSE' icon={<ExpandMoreIcon fontSize='small' />} />
            ) : (
              <ActionButton isLoading={d.loading} hide={isEmpty(d.assetPmsList)} action={e => expandCollapseAssetPMs(e, d)} tooltip='EXPAND' icon={<ChevronRightIcon fontSize='small' />} />
            )}
            <div className='d-flex'>
              <AssetTypeIcon type={d.assetIcon} />
              {d.name}
            </div>
          </div>
        )
      },
    },
    { name: 'Title', accessor: 'title' },
    { name: 'PM Plan', accessor: 'assetPlanName' },
    {
      name: 'Status',
      render: d => {
        const { color, label } = getChip(d.status, pmStatusOptions)
        if (!color) return ''
        return <StatusComponent color={color} label={label} size='small' />
      },
    },
    {
      name: 'Due In',
      render: d => {
        //handle for asset name row
        if (!has(d, 'dueDate') && !has(d, 'status')) return ''
        if (!d.dueDate && enums.PM.STATUS.COMPLETED !== d.status) return 'NA'
        const d1 = new Date()
        const d2 = new Date(d.dueDate)
        const isOverdue = d.pmDueOverdueFlag === enums.WO_DUE_FLAG.OVERDUE ? true : false
        const isDue = d.pmDueOverdueFlag === enums.WO_DUE_FLAG.DUE ? true : false //if only due then show orange
        const diffInDays = isOverdue ? -1 : isDue ? 35 : Math.ceil(Math.abs(d1 - d2) / (1000 * 60 * 60 * 24))
        // const diffInDays = d.isOverdue ? -1 : Math.ceil(Math.abs(d1 - d2) / (1000 * 60 * 60 * 24))
        const color = enums.PM.STATUS.COMPLETED !== d.status ? getDueInColor(diffInDays) : '#37d482'
        const label = enums.PM.STATUS.COMPLETED !== d.status ? d.dueIn : 'Completed'
        if (enums.PM.STATUS.COMPLETED === d.status) return ''
        if (!color) return 'N/A'
        return <StatusComponent color={color} label={label} size='small' filled />
      },
    },
    { name: 'Facility', accessor: 'facilityName' },
    {
      name: 'Actions',
      render: d => {
        return (
          isEmpty(d.assetPmsList) &&
          d.isCurrentAssetpm && (
            <div className='d-flex align-items-center'>
              <ActionButton hide={enums.PM.STATUS.COMPLETED === d.status} isLoading={loadingId === d.assetPmId} tooltip='EDIT' action={e => onEdit(e, d)} icon={<EditOutlinedIcon fontSize='small' />} />
              <ActionButton hide={enums.PM.STATUS.COMPLETED === d.status} tooltip='MARK COMPLETE' action={e => onComplete(e, d)} icon={<CheckOutlinedIcon fontSize='small' />} />
              <ActionButton hide={viewingId !== d.assetPmId} isLoading={viewingId === d.assetPmId} />
            </div>
          )
        )
      },
    },
  ]
  const fetchPM = async id => {
    try {
      const res = await preventativeMaintenance.asset.getPM({ id })
      if (res.success > 0) {
        setAnchorObj(res.data)
        return true
      } else throw new Error()
    } catch (error) {
      Toast.error(`Error fetching PM. Please try again !`)
      return false
    }
  }
  const completePM = async () => {
    setCompleteLoading(true)
    try {
      const res = await preventativeMaintenance.asset.markComplete({ assetPmId: anchorObj.assetPmId })
      if (res.success > 0) Toast.success(`PM Completed Successfully !`)
      else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error completing PM. Please try again !`)
    }
    setCompleteLoading(false)
    setCompleteOpen(false)
    reFetch()
  }
  const onView = async ({ assetPmId: id }) => {
    setViewingId(id)
    const dataFetched = await fetchPM(id)
    setViewingId('')
    if (dataFetched) setViewPMOpen(true)
  }

  const onEdit = async (e, { assetPmId: id }) => {
    e.stopPropagation()
    setLoadingId(id)
    const dataFetched = await fetchPM(id)
    setLoadingId('')
    if (dataFetched) setEditPMOpen(true)
  }
  const onComplete = async (e, { assetPmId }) => {
    e.stopPropagation()
    setAnchorObj({ assetPmId })
    setComment('')
    setCompleteOpen(true)
  }

  const expandCollapseAssetPMs = (e, list) => {
    e.stopPropagation()
    const topAsset = [...assetWisePMs]
    list.isExpanded = !list.isExpanded
    setAssetWisePMs(topAsset)
  }
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
    setPageIndex(newPage + 1)
  }
  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
    setPageIndex(1)
  }

  const handleExpandCollapse = () => {
    const allExpanded = datalist.every(data => data.isExpanded)
    setDatalist(
      datalist.map(item => ({
        ...item,
        isExpanded: !allExpanded,
      }))
    )
  }

  return (
    <>
      <div className='d-flex flex-row-reverse'>
        <MinimalButton onClick={handleExpandCollapse} text={datalist.every(item => item.isExpanded) ? 'Collapse All' : 'Expand All'} size='small' variant='contained' color='primary' baseClassName='nf-buttons ml-2 mt-2' disabled={isEmpty(datalist)} />
      </div>
      <div className='table-responsive dashboardtblScroll my-2' id='style-1' style={{ height: 'calc(100% - 270px)' }}>
        <TableHierarchy loading={loading} subAssetKey='assetPmsList' columns={assetWiseColumns} data={datalist} onRowClick={d => onView(d)} isForViewAction={true} />
      </div>
      {!isEmpty(get(data, 'list', [])) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={get(data, 'listsize', 0)} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}

      {isEditPMOpen && <EditAssetPM obj={anchorObj} open={isEditPMOpen} afterSubmit={reFetch} onClose={() => setEditPMOpen(false)} />}
      {isViewPMOpen && <ViewPM open={isViewPMOpen} onClose={() => setViewPMOpen(false)} obj={anchorObj} isAssetPM />}
      {isCompleteOpen && (
        <PopupModal cta='Complete' loadingText='Completing' open={isCompleteOpen} onClose={() => setCompleteOpen(false)} title='Mark Completed' loading={completeLoading} handleSubmit={completePM}>
          <MinimalTextArea rows={3} value={comment} onChange={e => setComment(e.target.value)} placeholder='Please enter comment here..' w={100} />
        </PopupModal>
      )}
    </>
  )
}

export default AssetWisePM
