import React, { useState } from 'react'

import useFetchData from 'hooks/fetch-data'
import { snakifyKeys } from 'helpers/formatters'
import { get, isEmpty } from 'lodash'

import SearchComponent from 'components/common/search'
import { StatusComponent } from 'components/common/others'
import { TableComponent } from 'components/common/table-components'
import { typeOptions, statusChipOptions, getChip } from 'components/Issues/utlis'
import { workOrderTypesPath } from 'components/WorkOrders/utils'

import issues from 'Services/issues'

const NewIssues = ({ woId, viewTempIssue, isShowWoDetails }) => {
  const [searchString, setSearchString] = useState('')

  const formatData = data => {
    const mainList = data?.mainIssueList ?? []
    const tempList = (data?.tempIssueList ?? []).map(d => ({ ...d, isTemp: true }))
    return [...mainList, ...tempList]
  }
  const { loading, data } = useFetchData({ fetch: issues.getIssuesByWorkorder, payload: snakifyKeys({ searchString, woId }), formatter: d => formatData(get(d, 'data', {})) })
  const columns = [
    { name: 'Issue Name', render: d => (isEmpty(d.issueTitle) ? 'N/A' : d.issueTitle.split('_').join(' - ')) },
    { name: 'Asset Name', accessor: 'assetName' },
    {
      name: 'Issue Type',
      render: d => {
        const type = typeOptions.find(q => q.value === d.issueType)
        return <div className='py-1'>{get(type, 'label', 'NA')}</div>
      },
    },
    {
      name: 'Origin WO#',
      render: d => {
        if (!d.originManualWoNumber) return
        return (
          <div className='d-flex align-items-center' style={{ cursor: 'pointer' }}>
            <span onClick={e => openOriginWo(e, d)} className='text-bold mr-2' style={{ color: '#003DDA', textDecoration: 'underline', fontStyle: 'italic' }}>
              {d.originManualWoNumber}
            </span>
            {woId === d.originWoId && d.isTemp && <StatusComponent color='#003DDA' label='NEW' filled size='small' />}
          </div>
        )
      },
    },
    {
      name: 'Status',
      render: d => {
        const { color, label } = getChip(d.issueStatus, statusChipOptions)
        if (!color) return 'NA'
        return <StatusComponent color={color} label={label} filled size='small' />
      },
    },
  ]
  const openOriginWo = (event, data) => {
    event.stopPropagation()
    window.open(`../../../${workOrderTypesPath[data.originWoType]['path']}/${data.originWoId}?originWoLineId=${data.originWoLineId}`, '_blank')
  }

  return (
    <>
      <div className='d-flex flex-row-reverse align-items-center my-2' style={{ width: '100%' }}>
        <SearchComponent searchString={searchString} setSearchString={setSearchString} />
      </div>
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: isShowWoDetails ? `calc(100vh - 445px)` : `calc(100vh - 345px)`, marginTop: '10px' }}>
        <TableComponent loading={loading} columns={columns} data={data} />
      </div>
    </>
  )
}
export default NewIssues
