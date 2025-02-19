import React, { useState } from 'react'
import enums from 'Constants/enums'

import useFetchData from 'hooks/fetch-data'
import { get, isEmpty } from 'lodash'
import { Toast } from 'Snackbar/useToast'

import TablePagination from '@material-ui/core/TablePagination'

import { TableComponent } from 'components/common/table-components'
import { ActionButton } from 'components/common/buttons'
import View from 'components/WorkOrders/maintenance-forms/view'
import ViewIssue from 'components/WorkOrders/maintenance-forms/multi-step-forms/issue/view'
import ViewForm from 'components/preventative-maintenance/forms/view-form'
import ViewOB from 'components/WorkOrders/onboarding/view'
import ThermographyForm from 'components/preventative-maintenance/forms/thermography-form'

import { getDateTime } from 'helpers/getDateTime'
import { inspectionTypes } from 'components/WorkOrders/maintenance-forms/utils'

import asset from 'Services/assets'
import onBoardingWorkorder from 'Services/WorkOrder/on-boarding-wo'
import preventativeMaintenance from 'Services/preventative-maintenance'

const Maintenance = ({ assetId }) => {
  // main list
  const [pageIndex, setPageIndex] = useState(1)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [loadingId, setLoadingId] = useState('')
  const [anchorObj, setAnchorObj] = useState({})
  const [openType, setOpenType] = useState({ pm: false, install: false, other: false, pmThermo: false })
  const { initialLoading, data } = useFetchData({ fetch: asset.inspections.maintenance, payload: { pageIndex, pageSize, assetId }, formatter: d => get(d, 'data', []) })
  //
  const renderInspectionType = (text, x) => {
    const type = inspectionTypes.find(d => d.value === text)
    if (isEmpty(type)) return <div className='d-flex align-items-center py-1 mr-2'>N/A</div>
    if (type.value === enums.MWO_INSPECTION_TYPES.PM) return <div className='d-flex align-items-center py-1  mr-2'>{get(x, 'assetPmTitle', 'N/A')}</div>
    if (type.value === enums.MWO_INSPECTION_TYPES.INSTALL) return <div className='d-flex align-items-center py-1  mr-2'>{x.woType === enums.woType.InfraredScan ? 'Infrared Thermography' : x.woType === enums.woType.Maintainance ? 'Install/Add' : 'Onboarding'}</div>
    return <div className='d-flex align-items-center py-1  mr-2'>{type.label}</div>
  }
  const columns = [
    { name: 'Inspection Datetime', render: d => getDateTime(d.inspectedAt) },
    { name: 'Inspected By', accessor: 'modifiedByName' },
    {
      name: 'Inspection Classification',
      render: d => (
        <div className='d-flex justify-content-between align-items-center' style={{ width: '100%' }}>
          {renderInspectionType(d.inspectionType, d)}
          <ActionButton isLoading={loadingId === d.woonboardingassetsId} tooltip='' hide={isEmpty(loadingId)} />
        </div>
      ),
    },
  ]
  const handleAction = async d => {
    setLoadingId(d.woonboardingassetsId)
    const { PM, REPAIR, REPLACE, TROUBLE_CALL_CHECK, INSTALL, ISSUE } = enums.MWO_INSPECTION_TYPES
    const isPM = PM === d.inspectionType
    const formData = isPM ? await fetchPmFormJSON(d) : await fetchObData(d)
    isPM ? setAnchorObj({ ...formData, obj: d }) : setAnchorObj({ formData, ...formData.data, assetName: formData.data.mwoAssetName, woType: d.woType })
    const isThermo = d.pmInspectionTypeId === 1
    setOpenType({ pm: isPM && !isThermo, pmThermo: isPM && isThermo, install: INSTALL === d.inspectionType, other: [REPAIR, REPLACE, TROUBLE_CALL_CHECK, ISSUE].includes(d.inspectionType) })
    setLoadingId('')
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
  const fetchPmFormJSON = async ({ assetPmId, woonboardingassetsId }) => {
    try {
      const res = await preventativeMaintenance.forms.getLine({ assetPmId, woonboardingassetsId })
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
  // handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
    setPageIndex(newPage + 1)
  }
  const handleChangeRowsPerPage = event => {
    setPageSize(parseInt(event.target.value, 10))
    setPage(0)
    setPageIndex(1)
  }
  const handleClose = () => setOpenType({ pm: false, install: false, other: false, pmThermo: false })
  //
  return (
    <div style={{ height: 'calc(100% - 42px)', padding: '10px', minHeight: '400px' }}>
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100% - 35px)' }}>
        <TableComponent loading={initialLoading} columns={columns} data={get(data, 'list', [])} onRowClick={d => handleAction(d)} isForViewAction={true} />
      </div>
      {!isEmpty(get(data, 'list', [])) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={get(data, 'listsize', 0)} rowsPerPage={pageSize} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
      {/* {openType.other && <View obj={anchorObj} open={openType.other} onClose={handleClose} />} */}
      {openType.other && <ViewIssue open={openType.other} onClose={handleClose} woOBAssetID={get(anchorObj, 'woonboardingassetsId', '')} isAssetDetails />}
      {openType.install && <ViewOB isOnboarding={anchorObj.woType === enums.woType.OnBoarding} viewObj={anchorObj} open={openType.install} onClose={handleClose} />}
      {openType.pm && <ViewForm isView open={openType.pm} onClose={handleClose} data={anchorObj.data} obj={anchorObj.obj} submisson={anchorObj.submissionData} />}
      {openType.pmThermo && <ThermographyForm isView open={openType.pmThermo} onClose={handleClose} obj={anchorObj.obj} submisson={anchorObj.submissionData} />}
    </div>
  )
}

export default Maintenance
