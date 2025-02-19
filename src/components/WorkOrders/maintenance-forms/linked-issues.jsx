import React, { useState } from 'react'

import useFetchData from 'hooks/fetch-data'
import { camelizeKeys, snakifyKeys } from 'helpers/formatters'

import Drawer from '@material-ui/core/Drawer'

import { get, isEmpty } from 'lodash'
import { MinimalButton } from 'components/common/buttons'

import { formatIssues, RenderCheckBox, renderIssueTitle, renderIssueType } from 'components/WorkOrders/issues/utils'
import { FormTitle } from 'components/Maintainance/components'
import { TableComponent } from 'components/common/table-components'
import SearchComponent from 'components/common/search'

import issues from 'Services/issues'

const LinkedIssues = ({ open, onClose, obj = {}, setSelectedLinkedIssues, woId }) => {
  const [selected, setSelected] = useState([])
  const [searchString, setSearchString] = useState('')

  const { assignedAssetId, assetId, isTemp, value: issuesTempAssetId } = camelizeKeys(obj)
  const [linkedIssues, setLinkedIssues] = useState([])

  const { loading: issuesToLinkLoading, data: issuesToLink } = useFetchData({ fetch: issues.getIssuesToLink, payload: snakifyKeys({ assetId: assignedAssetId || assetId || null, woId, issuesTempAssetId: isTemp ? issuesTempAssetId : null }), formatter: d => formatIssues(get(d, 'data', {})), defaultValue: [] })

  const linkedIssueIds = linkedIssues.map(d => d.id)

  const handleCheckBoxChange = data => {
    if (selected.includes(data.id)) setSelected(p => p.filter(d => d !== data.id))
    else setSelected(p => [...p, data.id])
  }
  const columns = [
    { name: 'Select', render: d => <RenderCheckBox data={d} selected={selected} handleChange={handleCheckBoxChange} /> },
    { name: 'Issue Title', render: d => renderIssueTitle(d) },
    { name: 'Issue Type', render: d => renderIssueType(d) },
  ]
  const assign = () => {
    const issuesToBeAssigned = issuesToLink.filter(d => selected.includes(d.id))
    setLinkedIssues(p => [...p, ...issuesToBeAssigned])
    setSelectedLinkedIssues(p => [...p, ...issuesToBeAssigned])
    closeSelectionIssue()
    setSelected([])
  }
  const closeSelectionIssue = () => {
    onClose()
    setSelected([])
  }
  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title='Issue(s)' closeFunc={onClose} style={{ width: '100%', minWidth: '475px' }} />
      <div style={{ height: 'calc(100vh - 64px)' }}>
        <div className='d-flex flex-row-reverse mb-3 p-2' style={{ width: '100%' }}>
          <SearchComponent searchString={searchString} setSearchString={setSearchString} />
        </div>
        <div className='table-responsive dashboardtblScroll p-2' id='style-1' style={{ height: `calc(100% - 123px)` }}>
          <TableComponent loading={issuesToLinkLoading} columns={columns} data={issuesToLink.filter(d => !linkedIssueIds.includes(d.id) && d.issueTitle.toLowerCase().includes(searchString.toLowerCase()))} />
        </div>
        <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A660', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
          <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
          <MinimalButton variant='contained' color='primary' text='Save' disabled={isEmpty(selected)} onClick={assign} />
        </div>
      </div>
    </Drawer>
  )
}

export default LinkedIssues
