import React, { useEffect, useState } from 'react'
import { TableComponent } from 'components/common/table-components'

import { get, isEmpty, orderBy } from 'lodash'
import SearchComponent from 'components/common/search'
import { getFormatedDate } from 'helpers/getDateTime'
import { workOrderTypesPath } from 'components/WorkOrders/utils'
import { FilterPopup } from 'components/common/others'
import Button from '@material-ui/core/Button'
import enums from 'Constants/enums'
import { CustomInviteesTooltip } from 'components/WorkOrders/onboarding/utils'
import RefreshOutlinedIcon from '@material-ui/icons/RefreshOutlined'

const WorkOrderList = ({ vendorId, workOrderList, loading, reFetch }) => {
  const [searchString, setSearchString] = useState('')
  const [selectedWOType, setSelectedWOType] = useState({})
  const [rows, setRows] = useState([...workOrderList])

  const columns = [
    { name: 'WO#', accessor: 'manualWoNumber' },
    { name: 'WO Type', render: d => workOrderTypesPath[d.woType]['label'] },
    { name: 'Facility', accessor: 'siteName' },
    { name: 'Start Date', render: d => getFormatedDate(d.startDate.split('T')[0]) },
    { name: 'Due Date', render: d => getFormatedDate(d.dueAt.split('T')[0]) },
    {
      name: 'Invitees',
      render: d => {
        return (
          <CustomInviteesTooltip list={orderBy(get(d, 'contactsInviteStatus', []), [d => d.name && d.name.toLowerCase()], 'asc')}>
            <div style={{ minHeight: '25px', alignContent: 'center' }}>
              <span style={{ color: '#41BE73' }}>{d?.acceptedCount ? d?.acceptedCount : 0} Accepted</span> out of {d?.totalCount ? d?.totalCount : 0}
            </div>
          </CustomInviteesTooltip>
        )
      },
    },
  ]

  useEffect(() => {
    let filteredRows = [...workOrderList]

    if (!isEmpty(searchString)) {
      filteredRows = workOrderList.filter(x => x.manualWoNumber !== null && x.manualWoNumber.toLowerCase().includes(searchString.toLowerCase()))
    } else {
      filteredRows = [...workOrderList]
    }

    if (selectedWOType && selectedWOType?.value != null) {
      filteredRows = filteredRows.filter(x => x.woType !== null && x.woType === selectedWOType?.value)
    }
    setRows(filteredRows)
  }, [searchString, selectedWOType, workOrderList])

  const handleContactView = data => {
    const d = workOrderTypesPath[data.woType]['path']
    window.open(`/${d}/${data.woId}`)
  }

  const handleRefreshbtn = () => {
    reFetch()
  }

  return (
    <div style={{ background: '#fff', height: 'calc(100vh - 64px)', width: '100%', margin: '20px 0 20px 0px' }}>
      <div className='d-flex justify-content-between align-items-center' style={{ width: '100%', marginBottom: '20px' }}>
        <div>
          <FilterPopup selected={selectedWOType} onChange={d => setSelectedWOType(d)} onClear={() => setSelectedWOType({})} placeholder='WO Type' options={enums.WO_TYPE_LIST} baseClassName='mr-2 mb-2' />
        </div>
        <div className='d-flex align-items-center'>
          <SearchComponent placeholder='Search' searchString={searchString} setSearchString={setSearchString} />
          <Button size='small' onClick={handleRefreshbtn} startIcon={<RefreshOutlinedIcon />} variant='contained' color='primary' className='nf-buttons ml-3' disableElevation>
            Refresh Invitees
          </Button>
        </div>
      </div>
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100% - 115px)' }}>
        <TableComponent loading={loading} columns={columns} data={rows} isForViewAction={true} onRowClick={d => handleContactView(d)} />
      </div>
    </div>
  )
}

export default WorkOrderList
