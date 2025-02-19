import React, { useState } from 'react'
import _ from 'lodash'
import useFetchData from 'hooks/fetch-data'
import reviews from 'Services/reviews'
import TablePagination from '@material-ui/core/TablePagination'
import { AppBar, Tooltip, withStyles, Chip, IconButton, Modal } from '@material-ui/core'
import GetAppIcon from '@material-ui/icons/GetApp'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import CloseIcon from '@material-ui/icons/Close'
import FilterListIcon from '@material-ui/icons/FilterList'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import { MinimalFilterSelector } from 'components/Assets/components'
import SearchComponent from 'components/common/search'
import { TableComponent } from 'components/common/table-components'
import { getChip } from 'components/Issues/utlis'
import { PopupModal, StatusComponent } from 'components/common/others'
import { ActionButton } from 'components/common/buttons'
import enums from 'Constants/enums'
import { getFormatedDate } from 'helpers/getDateTime'
import { camelizeKeys } from 'helpers/formatters'

export const reportStatusOptions = [
  { label: 'Success', value: enums.NETAINSPECTION_REPORT_STATUS_TYPE.COMPLETED, color: '#5D8C21' },
  { label: 'In Progress', value: enums.NETAINSPECTION_REPORT_STATUS_TYPE.IN_PROGRESS, color: '#3291DD' },
  { label: 'Failed', value: enums.NETAINSPECTION_REPORT_STATUS_TYPE.FAILED, color: '#FA0B0B' },
  { label: 'Partially Completed', value: enums.NETAINSPECTION_REPORT_STATUS_TYPE.PARTIAL_COMPLETED, color: '#FCBA03' },
]

export const reportInspectionTypeOptions = [
  { label: 'Acceptance Test', value: enums.REPORT_INSPECTION_TYPE.ACCEPTANCE_TEST },
  { label: 'Maintenance', value: enums.REPORT_INSPECTION_TYPE.MAINTENANCE },
]

const Report = () => {
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [page, setPage] = useState(0)
  const [searchString, setSearchString] = useState('')
  const [type, setType] = useState(null)
  const [mainTab, setMainTab] = useState('ACCEPTANCE_TEST')
  const [reportStatus, setReportStatus] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalDetail, setModalDetail] = useState({ title: 'Failed Info', errors: [] })
  const payload = {
    pagesize: pageSize,
    pageindex: pageIndex,
    searchString: _.isEmpty(searchString) ? null : searchString,
    reportInspectionType: _.get(type, 'value', null),
    status: !_.isEmpty(reportStatus) ? reportStatus.value : null,
  }
  const { initialLoading, data } = useFetchData({ fetch: reviews.getAllNetaInspectionBulkReportTrackingList, payload, formatter: d => _.get(d, 'data', []), defaultValue: [] })

  const HtmlTooltip = withStyles(theme => ({
    tooltip: {
      backgroundColor: '#fff',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 300,
      maxHeight: 400,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9',
    },
  }))(Tooltip)

  const handleAssets = item => {
    if (_.isEmpty(item.assetsNameList)) return 'N/A'

    const maxVisibleItem = 2
    const visibleItem = _.get(item, 'assetsNameList', []).slice(0, maxVisibleItem)
    const remainingListItems = _.get(item, 'assetsNameList', []).length > maxVisibleItem ? item.assetsNameList.slice(maxVisibleItem) : []

    return (
      <div className='d-flex align-items-center'>
        {!_.isEmpty(visibleItem) &&
          visibleItem.map((d, idx) => (
            <div key={idx} className='ml-2 mt-2 mb-2'>
              <StatusComponent color='#848484' label={d} size='small' />
            </div>
          ))}
        {!_.isEmpty(remainingListItems) && (
          <div className='ml-2'>
            <HtmlTooltip
              placement='right'
              title={remainingListItems.map((item, index) => (
                <Chip size='small' key={index} label={item} style={{ marginRight: '5px', marginBottom: '5px' }} />
              ))}
            >
              <div>
                <StatusComponent color='#848484' label={`+${remainingListItems.length}`} size='small' filled={true} />
              </div>
            </HtmlTooltip>
          </div>
        )}
      </div>
    )
  }

  const columns = [
    { name: 'Report ID', accessor: 'reportIdNumber' },
    {
      name: 'Assets Name',
      render: d => handleAssets(d),
    },
    { name: 'Created By', accessor: 'createdByName' },
    {
      name: 'Date Time',
      render: d => {
        if (_.isEmpty(d.reprtCompletedDate)) return 'NA'
        return getFormatedDate(d.reprtCompletedDate, true)
      },
    },
    {
      name: (
        <>
          {'Type'} <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
        </>
      ),
      render: d => (d.reportInspectionType === enums.REPORT_INSPECTION_TYPE.ACCEPTANCE_TEST ? 'Acceptance Test' : 'Maintenance'),
      filter: () => <MinimalFilterSelector options={reportInspectionTypeOptions} value={type} onChange={d => setType(d)} placeholder='Type' w={100} isClearable baseStyles={{ marginTop: '6px' }} />,
    },
    {
      name: (
        <>
          {'Status'}
          <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
        </>
      ),
      render: d => {
        const { color, label } = getChip(d.reportStatus, reportStatusOptions)
        if (!color) return 'NA'
        if (d.reportStatus === enums.NETAINSPECTION_REPORT_STATUS_TYPE.FAILED || d.reportStatus === enums.NETAINSPECTION_REPORT_STATUS_TYPE.PARTIAL_COMPLETED) {
          const errorLogs = !_.isEmpty(d.reportLambdaLogs) && isJson(d.reportLambdaLogs) ? camelizeKeys(JSON.parse(d.reportLambdaLogs)) : []
          return (
            <>
              <StatusComponent color={color} label={label} size='small' />
              {!_.isEmpty(errorLogs) && <ActionButton icon={<InfoOutlinedIcon size='small' />} tooltipPlacement='top' tooltip='Failed Info' action={() => showFailedInfo(d)} disabled={_.isEmpty(d.reportLambdaLogs)} />}
            </>
          )
        } else {
          return <StatusComponent color={color} label={label} size='small' />
        }
      },
      filter: () => <MinimalFilterSelector options={reportStatusOptions} value={reportStatus} onChange={d => setReportStatus(d)} placeholder='Status' w={100} isClearable baseStyles={{ marginTop: '6px' }} />,
    },
    {
      name: 'Action',
      render: d => {
        return <ActionButton icon={<GetAppIcon size='small' />} tooltipPlacement='top' tooltip='Download' action={() => window.open(d.reportUrl, '_blank')} disabled={_.isEmpty(d.reportUrl) || d.reportStatus === enums.NETAINSPECTION_REPORT_STATUS_TYPE.FAILED} />
      },
    },
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

  const resetFilter = () => {
    setPageSize(20)
    setPage(0)
    setPageIndex(1)
    setReportStatus(null)
    setSearchString('')
  }

  const showFailedInfo = detail => {
    const modalDetail = {
      title: !_.isEmpty(detail.reportIdNumber) ? 'Report ID ' + detail.reportIdNumber + ' Failed Info' : 'Failed Info',
      errors: !_.isEmpty(detail.reportLambdaLogs) && isJson(detail.reportLambdaLogs) ? camelizeKeys(JSON.parse(detail.reportLambdaLogs)) : [],
    }
    setModalDetail(modalDetail)
    setIsModalOpen(true)
  }

  const isJson = str => {
    try {
      JSON.stringify(JSON.parse(str))
      return true
    } catch (e) {
      return false
    }
  }
  return (
    <div style={{ height: 'calc(100vh - 128px)', paddingTop: '6px', background: '#fff' }}>
      {/* <div className='assets-box-wraps customtab'>
        <AppBar position='static' color='inherit'>
          <Tabs
            id='controlled-tab-example'
            activeKey={mainTab}
            onSelect={k => {
              setMainTab(k)
              if (k === 'MAINTENANCE') setType(enums.REPORT_INSPECTION_TYPE.MAINTENANCE)
              else setType(enums.REPORT_INSPECTION_TYPE.ACCEPTANCE_TEST)
              resetFilter()
            }}
          >
            <Tab eventKey='ACCEPTANCE_TEST' title='Acceptance Tests' tabClassName='font-weight-bolder small-tab'></Tab>
            <Tab eventKey='MAINTENANCE' title='Maintenance' tabClassName='font-weight-bolder small-tab'></Tab>
          </Tabs>
        </AppBar>
      </div> */}
      <>
        <div className='d-flex flex-row justify-content-sm-end align-items-center mb-2 mt-2' style={{ minWidth: '333px' }}>
          <SearchComponent postClear={postSearch} postSearch={postSearch} searchString={searchString} setSearchString={setSearchString} />
        </div>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100% - 135px)' }}>
          <TableComponent loading={initialLoading} columns={columns} data={_.get(data, 'list', [])} hasFilters />
        </div>
        {!_.isEmpty(_.get(data, 'list', [])) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={_.get(data, 'listsize', 0)} rowsPerPage={pageSize} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
      </>
      {isModalOpen && (
        <>
          <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} aria-labelledby='simple-modal-title' aria-describedby='simple-modal-description'>
            <div style={modalStyle} className='add-task-modal'>
              <div className='d-flex flex-row justify-content-between align-items-center px-3 py-2' style={{ background: '#e0e0e080' }}>
                <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'EudoxusSans-Medium' }}>{_.get(modalDetail, 'title', '')}</div>
                <IconButton onClick={() => setIsModalOpen(false)} size='small'>
                  <CloseIcon fontSize='small' />
                </IconButton>
              </div>
              <div style={{ padding: '16px' }}>
                {_.isArray(modalDetail.errors) && (
                  <>
                    <span>Unfortunately, {_.get(modalDetail, 'errors', []).length} assets encountered issues during report generation. Here's a breakdown of the failures:</span>
                    {_.get(modalDetail, 'errors', []).map(e => (
                      <>
                        <br />
                        <span>
                          {e.assetName} : {e.error}
                        </span>
                      </>
                    ))}
                  </>
                )}
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  )
}

const modalStyle = {
  top: `30%`,
  left: `50%`,
  transform: `translate(-50%, -50%)`,
  position: 'absolute',
  background: '#fff',
  width: '30%',
  maxHeight: 'calc(100vh - 130px)',
}

export default Report
