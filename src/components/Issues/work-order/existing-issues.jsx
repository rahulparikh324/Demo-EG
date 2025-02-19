import React, { useState, useContext, useEffect, useRef } from 'react'
import useFetchData from 'hooks/fetch-data'
import { chunk, get, isEmpty } from 'lodash'

import Drawer from '@material-ui/core/Drawer'
import Radio from '@material-ui/core/Radio'
import TablePagination from '@material-ui/core/TablePagination'

import { FormTitle } from 'components/Maintainance/components'
import SearchComponent from 'components/common/search'
import { TableComponent } from 'components/common/table-components'
import { MinimalButton } from 'components/common/buttons'
import { FilterPopup, MinimalCheckbox, StatusComponent } from 'components/common/others'
import issueContext from 'components/WorkOrders/maintenance-forms/multi-step-forms/issue/context'

import issues from 'Services/issues'
import enums from 'Constants/enums'

import { priorityOptions, getChip, typeOptions, statusChipOptions } from 'components/Issues/utlis'
import { assetTypeOfIssue } from 'components/WorkOrders/maintenance-forms/multi-step-forms/issue/utils.js'
import { RenderCheckBox } from 'components/WorkOrders/issues/utils'
import usePostData from 'hooks/post-data'
import { Toast } from 'Snackbar/useToast'

const inspectionTypes = [
  { label: 'Repair', value: enums.MWO_INSPECTION_TYPES.REPAIR },
  { label: 'Replace', value: enums.MWO_INSPECTION_TYPES.REPLACE },
  { label: 'General Issue Resolution', value: enums.MWO_INSPECTION_TYPES.TROUBLE_CALL_CHECK },
]

const ExistingIssues = ({ open, onClose, workOrderID, refetchData, createNew }) => {
  const [page, setPage] = useState(0)
  const [pageIndex, setPageIndex] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [searchString, setSearchString] = useState('')
  const formateIssueList = data => {
    const labelObj = {}
    data.list.forEach(d => {
      labelObj[d.assetIssueId] = Object.keys(typeContext).includes(d.assetIssueId) ? typeContext[d.assetIssueId] : inspectionTypes[0]
    })
    setType(labelObj)
    return data
  }
  const { loading, data } = useFetchData({ fetch: issues.getListOptimized, payload: { page_index: pageIndex, page_size: rowsPerPage, searchString, status: [enums.woTaskStatus.Open] }, formatter: d => formateIssueList(get(d, 'data', [])) })
  const [isAllSelected, setAllSelected] = useState(false)
  const [selected, setSelected] = useState([])
  const [type, setType] = useState({})
  const [typeContext, setTypeContext] = useState({})
  const { updateIssueDetails } = useContext(issueContext)
  const [isIssueChunkFail, setIssueChunkFail] = useState(false)
  const isFirstRender = useRef(true)

  const postSuccess = res => {
    if (res.success !== 1) {
      setIssueChunkFail(true)
    }
    // history.push({ pathname: `workorders/details/${workOrderID}`, state: { tab: 'NEW_ISSUES' } })
  }

  const postError = () => {
    setIssueChunkFail(true)
  }

  const { loading: isLoading, mutate: assignIssue } = usePostData({
    executer: issues.linkIssueToWOFromIssueListTab,
    postSuccess,
    postError,
    message: { success: 'Record Added Successfully!', error: 'Something went wrong' },
    hideMessage: true,
  })

  const selectAndDeSelectAll = () => {
    const listIds = new Set(get(data, 'list', []).map(d => d.assetIssueId))

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

  // columns
  const columns = [
    { name: 'Issue Title', render: d => d.issueTitle?.split('_').join(' - ') },
    { name: 'Asset Name', render: d => d.assetName },
    {
      name: 'Status',
      render: d => {
        const { color, label } = getChip(d.issueStatus, statusChipOptions)
        if (!color) return 'NA'
        return <StatusComponent color={color} label={label} size='small' />
      },
    },
    {
      name: 'Priority',
      render: d => {
        const { color, label } = getChip(d.priority, priorityOptions)
        if (!color) return 'NA'
        return <StatusComponent color={color} label={label} size='small' />
      },
    },
    {
      name: 'Type',
      render: d => <FilterPopup selected={type[d.assetIssueId]} onChange={v => handleSelectChange(d, v)} options={inspectionTypes} placeholder={d.issueType} closeIcon={false} />,
    },
    {
      name: <MinimalCheckbox style={{ marginLeft: '3px' }} selected={isAllSelected} onClick={selectAndDeSelectAll} />,
      render: d => {
        return <RenderCheckBox data={d} accessor='assetIssueId' selected={selected} handleChange={handleCheckBoxChange} />
      },
    },
  ]

  const handleCheckBoxChange = data => {
    let updatedMarkedRows
    if (selected.includes(data.assetIssueId)) {
      setSelected(p => p.filter(d => d !== data.assetIssueId))
      updatedMarkedRows = selected.filter(d => d !== data.assetIssueId)
    } else {
      setSelected(p => [...p, data.assetIssueId])
      setTypeContext(p => ({ ...p, [data.assetIssueId]: type[data.assetIssueId] }))
      updatedMarkedRows = [...selected, data.assetIssueId]
    }

    if (updatedMarkedRows.length === 0) {
      setAllSelected(false)
    } else if (get(data, 'list', []).every(d => updatedMarkedRows.includes(d.assetIssueId))) {
      setAllSelected(true)
    } else {
      setAllSelected(false)
    }
  }

  const handleSelectChange = (data, val) => {
    setType(p => ({ ...p, [data.assetIssueId]: val }))
    setTypeContext(p => ({ ...p, [data.assetIssueId]: val }))
  }
  // pagination + search
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
    setPageIndex(newPage + 1)
  }
  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
    setPageIndex(1)
  }
  const postSearch = () => {
    setPage(0)
    setPageIndex(1)
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (get(data, 'list', []).every(d => selected.includes(d.assetIssueId))) {
      setAllSelected(true)
    } else {
      setAllSelected(false)
    }
  }, [page, selected, data])

  // when on next
  const handleNext = () => {
    const selectedIssue = get(data, 'list', []).find(d => d.assetIssueId === selected)
    const asset = { type: 'ADD_EXISTING', linkedAsset: { assetId: selectedIssue.assetId, value: selectedIssue.assetId, label: selectedIssue.assetName, assetName: selectedIssue.assetName } }
    updateIssueDetails('issueDetails', { ...selectedIssue, asset, isAnExistingIssue: true, issueType: typeOptions.find(q => q.value === selectedIssue.issueType) })
    createNew()
  }
  const handleAssignIssue = async () => {
    const list = selected.map(d => ({ woId: workOrderID, assetIssueId: d, woType: isEmpty(typeContext[d]) ? get(type[d], 'value', '') : get(typeContext[d], 'value', '') }))

    const itemChunks = chunk(list, enums.COMMON_UPLOAD_CHUNK_SIZE)
    if (isEmpty(itemChunks)) {
      setIssueChunkFail(true)
      return
    } else {
      for (const chunk of itemChunks) {
        await assignIssue({ linkIssueList: chunk })
      }
    }

    if (!isIssueChunkFail) {
      Toast.success('Record Added Successfully!')
    } else {
      Toast.error('Something went wrong')
    }

    refetchData()
  }
  const handleCreateNew = () => {
    const createNewAssetInfo = { asset: { type: assetTypeOfIssue[0].value }, priority: priorityOptions[0].value }
    updateIssueDetails('issueDetails', createNewAssetInfo)
    createNew()
  }

  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title='Select Existing Issue' style={{ width: '100%', minWidth: '450px' }} closeFunc={onClose} />
      <div style={{ height: 'calc(100vh - 126px)', background: '#fff', padding: '16px', width: '70vw' }}>
        <div className='d-flex justify-content-end align-items-center mb-2' style={{ width: '100%' }}>
          <SearchComponent placeholder='Search' postClear={postSearch} postSearch={postSearch} searchString={searchString} setSearchString={setSearchString} />
          <MinimalButton size='small' variant='contained' color='primary' text='Create New' onClick={handleCreateNew} baseClassName='ml-2' />
        </div>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100% - 115px)' }}>
          <TableComponent loading={loading} columns={columns} data={get(data, 'list', [])} isForViewAction={true} />
        </div>
        {!isEmpty(get(data, 'list', [])) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={get(data, 'listsize', 0)} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
      </div>
      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A660', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
        <MinimalButton variant='contained' color='primary' text='Add' loadingText='Adding...' disabled={isEmpty(selected) || isLoading} loading={isLoading} onClick={handleAssignIssue} />
      </div>
    </Drawer>
  )
}

export default ExistingIssues
