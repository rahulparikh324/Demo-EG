import React, { useState } from 'react'

import useFetchData from 'hooks/fetch-data'
import { snakifyKeys, camelizeKeys } from 'helpers/formatters'
import { get, isEmpty } from 'lodash'
import enums from 'Constants/enums'

import Drawer from '@material-ui/core/Drawer'
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined'
import { Toast } from 'Snackbar/useToast'

import { FormTitle } from 'components/Maintainance/components'
import { MinimalButton } from 'components/common/buttons'
import { LoaderContainer, EmptyState } from 'components/common/others'
import SearchComponent from 'components/common/search'
import { TableComponent } from 'components/common/table-components'

import issues from 'Services/issues'

import { formatIssues, renderIssueTitle, renderIssueType, renderIssueStatus, RenderCheckBox, IssueCard } from './utils'

const LinkFixIssues = ({ open, onClose, obj, woId }) => {
  const { woonboardingassetsId, assetFormId, assignedAssetId, assetId, statusId, woStatus } = camelizeKeys(obj)
  const isReadOnly = statusId === enums.woTaskStatus.Complete || woStatus === enums.woTaskStatus.Complete
  const payload = snakifyKeys({ woonboardingassetsId: woonboardingassetsId || null, assetFormId: assetFormId || null, searchString: null })
  const [isProcessing, setIsProcessing] = useState(false)
  const { loading: linkedIssuesLoading } = useFetchData({ fetch: issues.getLinkedIssues, payload, formatter: d => setLinkedIssues(formatIssues(get(d, 'data', {}))) })
  const [linkedIssues, setLinkedIssues] = useState([])
  //
  const { loading: issuesToLinkLoading, data: issuesToLink } = useFetchData({ fetch: issues.getIssuesToLink, payload: snakifyKeys({ assetId: assignedAssetId || assetId }), formatter: d => formatIssues(get(d, 'data', {})), defaultValue: [] })
  const [isLinkIssuePopupOpen, setLinkIssuePopupOpen] = useState(false)
  const [searchString, setSearchString] = useState('')
  const [selected, setSelected] = useState([])
  const [deleted, setDeleted] = useState([])
  const linkedIssueIds = linkedIssues.map(d => d.id)
  const isUpdateDisabled = isEmpty(linkedIssues) && isEmpty(deleted)
  //
  const update = async () => {
    const assetIssueId = []
    const woLineIssueId = []
    const deletedAssetIssueId = []
    const deletedWoLineIssueId = []
    linkedIssues.forEach(d => (d.isTemp ? woLineIssueId.push(d.id) : assetIssueId.push(d.id)))
    deleted.forEach(d => (d.isTemp ? deletedWoLineIssueId.push(d.id) : deletedAssetIssueId.push(d.id)))
    const payload = snakifyKeys({ woonboardingassetsId, assetFormId: assetFormId || null, woId, assetIssueId, woLineIssueId, deletedAssetIssueId, deletedWoLineIssueId })
    try {
      setIsProcessing(true)
      const res = await issues.linkIssueToWorkOrder(payload)
      if (res.success > 0) Toast.success(`Issues linked Successfully !`)
      else Toast.error(res.message)
      setIsProcessing(false)
    } catch (error) {
      Toast.error(`Error linking Issues. Please try again !`)
      setIsProcessing(false)
    }
    onClose()
  }
  const assign = () => {
    const issuesToBeAssigned = issuesToLink.filter(d => selected.includes(d.id))
    setLinkedIssues(p => [...p, ...issuesToBeAssigned])
    closeSelectionIssueList()
    setSelected([])
  }
  const handleCheckBoxChange = data => {
    if (selected.includes(data.id)) setSelected(p => p.filter(d => d !== data.id))
    else setSelected(p => [...p, data.id])
  }
  const removeIssue = data => {
    setDeleted(p => [...p, data])
    setLinkedIssues(p => p.filter(d => d.id !== data.id))
  }
  const closeSelectionIssueList = () => {
    setLinkIssuePopupOpen(false)
    setSelected([])
  }
  //
  const columns = [
    { name: 'Issue Name', render: d => renderIssueTitle(d) },
    { name: 'Issue Type', render: d => renderIssueType(d) },
    { name: 'Status', render: d => renderIssueStatus(d) },
    { name: 'Action', render: d => <RenderCheckBox data={d} selected={selected} handleChange={handleCheckBoxChange} /> },
  ]
  //
  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title='Issues' closeFunc={onClose} style={{ width: '100%', minWidth: '450px' }} />
      <div className='p-2' style={{ height: 'calc(100vh - 64px)' }}>
        <div className='d-flex flex-row-reverse mb-2'>
          <MinimalButton disabled={isReadOnly} size='small' variant='contained' color='primary' text='Link - Fix Issues' onClick={() => setLinkIssuePopupOpen(true)} />
        </div>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100% - 36px)', height: 'calc(100% - 36px)' }}>
          {linkedIssuesLoading ? <LoaderContainer /> : isEmpty(linkedIssues) ? <EmptyState icon={<ErrorOutlineOutlinedIcon style={{ fontSize: '32px', color: '#666' }} />} text='No Issues linked !' /> : linkedIssues.map(d => <IssueCard readOnly={isReadOnly} remove={removeIssue} key={d.id} data={d} />)}
        </div>
      </div>
      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A660', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
        <MinimalButton variant='contained' color='primary' text='Update' loadingText='Updating...' loading={isProcessing} disabled={isProcessing || isUpdateDisabled || isReadOnly} onClick={update} />
      </div>
      {isLinkIssuePopupOpen && (
        <Drawer anchor='right' open={isLinkIssuePopupOpen} onClose={closeSelectionIssueList}>
          <FormTitle title='Issues' closeFunc={closeSelectionIssueList} style={{ width: '100%', minWidth: '700px' }} />
          <div style={{ height: 'calc(100vh - 64px)' }}>
            <div className='d-flex flex-row-reverse mb-3 p-2' style={{ width: '100%' }}>
              <SearchComponent searchString={searchString} setSearchString={setSearchString} />
            </div>
            <div className='table-responsive dashboardtblScroll p-2' id='style-1' style={{ height: `calc(100% - 123px)` }}>
              <TableComponent loading={issuesToLinkLoading} columns={columns} data={issuesToLink.filter(d => !linkedIssueIds.includes(d.id) && d.issueTitle.toLowerCase().includes(searchString.toLowerCase()))} />
            </div>
            <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A660', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
              <MinimalButton variant='contained' color='default' text='Cancel' onClick={closeSelectionIssueList} />
              <MinimalButton variant='contained' color='primary' text='Add' disabled={isEmpty(selected)} onClick={assign} />
            </div>
          </div>
        </Drawer>
      )}
    </Drawer>
  )
}

export default LinkFixIssues
