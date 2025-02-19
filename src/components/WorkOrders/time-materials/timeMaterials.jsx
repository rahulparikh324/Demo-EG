import React, { useRef, useState } from 'react'

import useFetchData from 'hooks/fetch-data'
import usePostData from 'hooks/post-data'
import { Toast } from 'Snackbar/useToast'
import enums from 'Constants/enums'

import { LabelVal, Menu, DropDownMenu, ToggleButton, ElipsisWithTootip, StatusSelectPopup } from 'components/common/others'
import SearchComponent from 'components/common/search'
import { TableComponent } from 'components/common/table-components'
import AddTimeMaterials from 'components/WorkOrders/time-materials/addTimeMaterials'
import { TitleCount, timeCategoty, quantityType, burdenTypeOptions, statusOptions } from 'components/WorkOrders/utils'
import DialogPrompt from 'components/DialogPrompt'
import { AppendRandomValueToS3Url } from 'components/WorkOrders/onboarding/utils'

import AddIcon from '@material-ui/icons/Add'
import TablePagination from '@material-ui/core/TablePagination'
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined'
import PublishOutlinedIcon from '@material-ui/icons/PublishOutlined'

import timeMaterials from 'Services/WorkOrder/timeMaterials'
import { exportSpreadSheet } from 'helpers/export-spread-sheet'
import URL from 'Constants/apiUrls'

import { get, isEmpty } from 'lodash'
import XLSX from 'xlsx'
import * as yup from 'yup'

const TimeMaterials = ({ woId, countUpdate, woStatus, allCount, isShowWoDetails, quoteStatus, isQuote }) => {
  // const [subTab, setSubTab] = useState(enums.QUOTES.TIME_MATERIAL_CATEGORY.ALL)
  const [searchString, setSearchString] = useState('')
  const [page, setPage] = useState(0)
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [error, setError] = useState({})
  const [isOpenAddTimeMaterials, setOpenAddTimeMaterials] = useState(false)
  const [isOpenEditTimeMaterials, setOpenEditTimeMaterials] = useState(false)
  const [isOpenDeleteTimeMaterials, setOpenDeleteTimeMaterials] = useState(false)
  const [anchorObj, setAnchorObj] = useState({})
  const [statusFilter, setStatusFilter] = useState(null)

  const uploadTimeMaterialsRef = useRef()

  const { loading, data, reFetch } = useFetchData({
    fetch: timeMaterials.getTimeMaterials,
    payload: {
      pageindex: pageIndex,
      pagesize: pageSize,
      woId,
      searchString: searchString,
      timeMaterialCategoryType: statusFilter,
    },
    formatter: d => get(d, 'data', []),
  })

  const handleDeletePostSuccess = () => {
    setOpenDeleteTimeMaterials(false)
    reFetch()
    countUpdate()
  }

  const { loading: deleteLoading, mutate: deleteTimeMaterial } = usePostData({ executer: timeMaterials.addUpdateTimeMaterial, postSuccess: handleDeletePostSuccess, message: { success: `Time & Material Deleted Successfully !`, error: 'Something Went Wrong !' } })
  const handleDelete = () => deleteTimeMaterial({ timeMaterialId: get(anchorObj, 'timeMaterialId', ''), isDeleted: true })

  const menuOptions = [
    { id: 1, name: 'Edit', action: d => handleAction('EDIT', d), disabled: () => woStatus === enums.woTaskStatus.Complete || (isQuote && quoteStatus === enums.QUOTES.STATUS.ACCEPTED) || (isQuote && quoteStatus === enums.QUOTES.STATUS.REJECTED) || (isQuote && quoteStatus === enums.QUOTES.STATUS.DEFERRED) },
    { id: 2, name: 'Delete', action: d => handleAction('DELETE', d), color: '#FF0000', disabled: () => woStatus === enums.woTaskStatus.Complete || (isQuote && quoteStatus === enums.QUOTES.STATUS.ACCEPTED) || (isQuote && quoteStatus === enums.QUOTES.STATUS.REJECTED) || (isQuote && quoteStatus === enums.QUOTES.STATUS.DEFERRED) },
  ]
  const handleAction = async (type, data) => {
    setAnchorObj(data)
    if (type === 'DELETE') setOpenDeleteTimeMaterials(true)
    if (type === 'EDIT') setOpenEditTimeMaterials(true)
  }

  const formateNumber = number => {
    if (number % 1 !== 0) {
      return number?.toFixed(2)
    } else {
      return number?.toString()
    }
  }

  const columns = [
    {
      name: 'Description',
      render: d => (
        <div style={{ minWidth: '198px' }}>
          <ElipsisWithTootip title={d.description} size={30} />
        </div>
      ),
    },
    { name: 'Item Code', accessor: 'itemCode' },
    { name: 'No Sub', render: d => <span>{d.noSubFlag === true ? 'True' : 'False'}</span> },
    { name: 'Quantity', render: d => <span>{d.quantityUnitType === enums.QUOTES.TIME_MATERIAL_UNIT.FEET ? `${formateNumber(d.quantity)}ft` : formateNumber(d.quantity)}</span> },
    { name: 'Rate', render: d => <span>${formateNumber(d.rate)}</span> },
    {
      name: 'Burden',
      render: d => (
        <span>
          {d.isBurdenEnabled && d.burden !== null ? (
            <>
              {d.burdenType === enums.QUOTES.BURDEN_TYPE.DOLLAR ? '$' : ''}
              {formateNumber(d.burden)}
              {d.burdenType === enums.QUOTES.BURDEN_TYPE.PERCENTAGE ? '%' : ''}
            </>
          ) : (
            '-'
          )}
        </span>
      ),
    },
    { name: <ElipsisWithTootip title='Amount = (Rate + Burden) * Quantity' size={6} />, render: d => <span>${formateNumber(d.amount)}</span> },
    { name: 'Markup%', render: d => <span>{d.isMarkupEnabled ? formateNumber(d.markup) : '-'}</span> },
    {
      name: 'Total',
      render: d => <span>${formateNumber(d.totalOfMarkup)}</span>,
    },
    {
      name: 'Action',
      render: d => (
        <div className='d-flex align-items-center'>
          <Menu options={menuOptions} data={d} width={165} />
        </div>
      ),
    },
  ]

  const handleChangePage = (e, newPage) => {
    setPage(newPage)
    setPageIndex(newPage + 1)
  }
  const handleChangeRowsPerPage = event => {
    setPageSize(parseInt(event.target.value, 10))
    setPage(0)
    setPageIndex(1)
  }

  const handleGetCategory = type => {
    const category = timeCategoty.find(cats => cats.value === type)
    return get(category, 'label', '')
  }
  const handleGetQuantityType = type => {
    const quantity = quantityType.find(cats => cats.value === type)
    return get(quantity, 'label', '')
  }

  const handleGetBurdenType = type => {
    const burden = burdenTypeOptions.find(d => d.value === type)
    return get(burden, 'label', '')
  }

  const exportPostSuccess = res => {
    if (res.success > 0) {
      const excelData = []
      const list = get(res, 'data.timeMaterialsList', [])
      list.forEach(d =>
        excelData.push({
          Description: d.description,
          'Item Code': d.itemCode,
          'No Sub': d.noSubFlag === true ? 'True' : 'False',
          Quantity: d.quantity,
          'Quantity Type': handleGetQuantityType(d.quantityUnitType),
          Rate: d.rate,
          'Amount (Quantity * Rate)$': d.amount,
          'Markup%': d.markup,
          Burden: d.burden ?? 0,
          'Burden Type': handleGetBurdenType(d.burdenType),
          Total: d.totalOfMarkup,
          Category: handleGetCategory(d.timeMaterialCategoryType),
        })
      )
      exportSpreadSheet({ data: excelData, fileName: 'Time & Materials' })
    }
  }

  const { loading: exportLoading, mutate: exportTimeMaterial } = usePostData({ executer: timeMaterials.getTimeMaterials, postSuccess: exportPostSuccess, message: { success: `Report Downloaded Successfully!`, error: 'Something Went Wrong !' } })
  const handleExportTimeMaterial = () => exportTimeMaterial({ pageindex: 0, pagesize: 0, woId, searchString: '', timeMaterialCategoryType: null })

  const handleUploadTimeMaterials = () => {
    setError('')
    uploadTimeMaterialsRef.current && uploadTimeMaterialsRef.current.click()
  }

  const addTimeMaterialsLine = e => {
    e.preventDefault()
    if (!e.target.files[0]) return
    const reader = new FileReader()
    const file = e.target.files[0]
    reader.onload = d => {
      const extension = file.name.split('.').slice(-1).pop()
      if (!['csv', 'xls', 'xlsx', 'xlsm', 'xltx', 'xltm'].includes(extension)) setError(enums.errorMessages.error_msg_file_format)
      else {
        setError('')
        const binaryStr = d.target.result
        const wb = XLSX.read(binaryStr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws, { raw: true })

        let rowObject = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
        const requiredKeys = ['Quantity', 'Quantity Type', 'Rate', 'Category', 'Item Code']

        const missingKeys = requiredKeys.filter(key => !rowObject[0].includes(key))
        const invalidFIle = requiredKeys.every(key => !rowObject[0].includes(key))

        if (invalidFIle) {
          setError('Invalid excel sheet, Please upload the valid excel sheet..')
        } else if (missingKeys.length > 0) {
          setError(`${missingKeys.join(', ')} ${missingKeys.length === 1 ? 'is' : 'are'} Required`)
        } else {
          setError('')
          validateSheetWOLine(data)
        }
      }
    }
    reader.readAsBinaryString(file)
    e.target.value = null
  }

  const validateSheetWOLine = async data => {
    try {
      const schema = yup.array().of(
        yup.object().shape({
          timeMaterialCategoryType: yup
            .number()
            .nullable()
            .required('Category is required')
            .test('is-valid-category', 'Category does not exist', function (value) {
              return value !== 0
            }),
          itemCode: yup.string().required('Item Code is required'),
          quantity: yup.number().nullable().required('Quantity is required').min(0.1, 'Quantity should be more than 0'),
          burden: yup.number().nullable().min(0.1, 'Burden should be more than 0'),
          quantityUnitType: yup.number().nullable().required('Unit is required'),
          rate: yup.number().nullable().required('Rate is required').min(0.1, 'Rate should be more than 0'),
          markup: yup
            .number()
            .transform(value => (isNaN(value) || value === null || value === undefined ? 0 : value))
            .min(0, 'Markup percentage should be between 0 and 100')
            .max(100, 'Markup percentage should be between 0 and 100'),
          burden: yup
            .number()
            .transform(value => (isNaN(value) || value === null || value === undefined ? 0 : value))
            .when('burdenType', {
              is: 1,
              then: yup.number().min(0, 'Burden should be more than 0'),
              otherwise: yup.number().min(0, 'Burden percentage should be between 0 and 100').max(100, 'Burden percentage should be between 0 and 100'),
            }),
        })
      )

      const parse = d => (isEmpty(d) ? null : d)
      const payload = data.map(d => {
        let timeMaterialCategoryValue = null

        if (!isEmpty(d['Category'])) {
          const timeMaterialCategory = timeCategoty.find(item => item.label?.toLowerCase() === d['Category']?.toLowerCase())
          timeMaterialCategoryValue = timeMaterialCategory ? timeMaterialCategory.value : 0
        }

        const quantityUnit = quantityType.find(item => item.label?.toLowerCase() === d['Quantity Type']?.toLowerCase())
        const quantityUnitValue = quantityUnit ? quantityUnit.value : null

        const burdenTypeCategory = burdenTypeOptions.find(item => item.label === d['Burden Type'])
        const burdenValue = burdenTypeCategory ? burdenTypeCategory.value : 2

        return {
          timeMaterialCategoryType: timeMaterialCategoryValue,
          description: get(d, 'Description', '').toString().trim(),
          itemCode: get(d, 'Item Code', '').toString().trim(),
          noSubFlag: parse(get(d, 'No Sub', '').toString().trim())?.toLowerCase() === 'true' ? true : false,
          quantity: parseFloat(get(d, 'Quantity', '')),
          quantityUnitType: quantityUnitValue,
          rate: parseFloat(get(d, 'Rate', '')),
          markup: parseFloat(get(d, 'Markup%', 0)) <= 0 ? 0 : parseFloat(get(d, 'Markup%', 0)) || 0,
          burdenType: burdenValue,
          burden: get(d, 'Burden', null),
          isBurdenEnabled: get(d, 'Burden', null) === null ? false : true,
          isMarkupEnabled: get(d, 'Markup%', 0) === 0 ? false : true,
          woId,
        }
      })

      await schema.validate(payload, { abortEarly: false })
      uploadTimeMaterials(payload)
    } catch (error) {
      console.log(error)
      try {
        const lineNo = Number(error.inner[0].path.split('.')[0].match(/\[(.*?)\]/)[1])
        setError(`${error.inner[0].message} on Line [${lineNo + 2}]`)
      } catch (error) {
        console.log(error)
        Toast.error(`Error reading file !`)
      }
    }
  }

  const handleBulkUploadPostSuccess = () => {
    countUpdate()
    reFetch()
  }

  const { mutate: importTimeMaterial } = usePostData({ executer: timeMaterials.bulkCreateTimeMaterialsWoLine, postSuccess: handleBulkUploadPostSuccess, message: { success: `Time & Material Added Successfully !`, error: 'Something Went Wrong !' } })
  const uploadTimeMaterials = payload => importTimeMaterial({ timeMaterialsList: payload })

  const checkFileValidity = (url, callback) => {
    const xhr = new XMLHttpRequest()
    xhr.open('HEAD', url, true)
    xhr.onload = () => {
      if (xhr.status === 200) {
        callback(url, true)
      } else {
        callback(url, false)
      }
    }
    xhr.onerror = () => {
      callback(url, false)
    }
    xhr.send()
  }

  const getTimeMaterialURLByDomainCompany = async callback => {
    const companyId = localStorage.getItem('companyId') !== null ? localStorage.getItem('companyId') : 'default'

    const newUrl = `${URL.s3TemplateHostURL}/${companyId}/Time_Materials.xlsx`
    const appendUrl = AppendRandomValueToS3Url(newUrl)

    checkFileValidity(appendUrl, (url, isValid) => {
      if (isValid) {
        callback(appendUrl)
      } else {
        const defaultUrl = `${URL.s3TemplateHostURL}/default/Time_Materials.xlsx`
        callback(AppendRandomValueToS3Url(defaultUrl))
      }
    })
  }
  const downloadSample = () => {
    getTimeMaterialURLByDomainCompany(url => {
      const link = document.createElement('a')
      link.href = url
      link.download = 'Time_Materials.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
  }

  const postSearch = () => {
    setPage(0)
    setPageIndex(1)
  }

  const dropDownMenuOptions = [
    {
      id: 1,
      type: 'button',
      text: 'Add Time & Materials',
      disabled: woStatus === enums.woTaskStatus.Complete || (isQuote && quoteStatus === enums.QUOTES.STATUS.ACCEPTED) || (isQuote && quoteStatus === enums.QUOTES.STATUS.REJECTED) || (isQuote && quoteStatus === enums.QUOTES.STATUS.DEFERRED),
      onClick: () => setOpenAddTimeMaterials(true),
      icon: <AddIcon fontSize='small' />,
      show: true,
    },
    {
      id: 2,
      type: 'button',
      text: 'Import Time & Materials',
      disabled: woStatus === enums.woTaskStatus.Complete || (isQuote && quoteStatus === enums.QUOTES.STATUS.ACCEPTED) || (isQuote && quoteStatus === enums.QUOTES.STATUS.REJECTED) || (isQuote && quoteStatus === enums.QUOTES.STATUS.DEFERRED),
      onClick: handleUploadTimeMaterials,
      icon: <PublishOutlinedIcon fontSize='small' />,
      show: true,
    },
    { id: 3, type: 'button', text: 'Export Time & Materials', disabled: data.listsize === 0, onClick: () => handleExportTimeMaterial(), icon: <GetAppOutlinedIcon fontSize='small' />, show: true },
    { id: 4, type: 'input', show: true, onChange: addTimeMaterialsLine, ref: uploadTimeMaterialsRef },
    { id: 5, type: 'button', text: 'Download Sample File', onClick: downloadSample, icon: <GetAppOutlinedIcon fontSize='small' />, show: true },
  ]

  return (
    <>
      {/* Header */}
      <div className='d-flex flex-row justify-content-between align-items-center mt-2' style={{ width: '100%' }}>
        <div className='d-flex align-items-center'>
          <StatusSelectPopup options={statusOptions} statusFilterValues={statusFilter} onChange={d => setStatusFilter(d)} style={{ marginRight: '10px' }} />
          <DropDownMenu dropDownMenuOptions={dropDownMenuOptions} error={error} />
          {exportLoading && <div className='ml-2 text-bold'>Exporting ...</div>}
          {!isEmpty(error) && <span style={{ fontWeight: 800, color: 'red', marginLeft: '16px' }}>{error}</span>}
        </div>
        {/* <div className='d-flex' style={{ padding: '2px', background: '#f6f6f6', width: 'fit-content', borderRadius: '4px' }}>
          <ToggleButton label={<TitleCount title='All' count={allCount} bg={subTab === enums.QUOTES.TIME_MATERIAL_CATEGORY.ALL ? '#fff' : ''} color={subTab === enums.QUOTES.TIME_MATERIAL_CATEGORY.ALL ? '#778899' : ''} />} value={enums.QUOTES.TIME_MATERIAL_CATEGORY.ALL} selected={subTab} onChange={v => (setSubTab(v), setPageIndex(1), setPage(0))} />
          <ToggleButton
            label={<TitleCount title='Labor' count={get(data, 'laborCount', 0)} bg={subTab === enums.QUOTES.TIME_MATERIAL_CATEGORY.LABOR ? '#fff' : ''} color={subTab === enums.QUOTES.TIME_MATERIAL_CATEGORY.LABOR ? '#778899' : ''} />}
            value={enums.QUOTES.TIME_MATERIAL_CATEGORY.LABOR}
            selected={subTab}
            onChange={v => (setSubTab(v), setPageIndex(1), setPage(0))}
          />
          <ToggleButton
            label={<TitleCount title='Materials' count={get(data, 'materialCount', 0)} bg={subTab === enums.QUOTES.TIME_MATERIAL_CATEGORY.MATERIALS ? '#fff' : ''} color={subTab === enums.QUOTES.TIME_MATERIAL_CATEGORY.MATERIALS ? '#778899' : ''} />}
            value={enums.QUOTES.TIME_MATERIAL_CATEGORY.MATERIALS}
            selected={subTab}
            onChange={v => (setSubTab(v), setPageIndex(1), setPage(0))}
          />
          <ToggleButton
            label={<TitleCount title='Miscellaneous' count={get(data, 'miscellaneousCount', 0)} bg={subTab === enums.QUOTES.TIME_MATERIAL_CATEGORY.MISCELLANEOUS ? '#fff' : ''} color={subTab === enums.QUOTES.TIME_MATERIAL_CATEGORY.MISCELLANEOUS ? '#778899' : ''} />}
            value={enums.QUOTES.TIME_MATERIAL_CATEGORY.MISCELLANEOUS}
            selected={subTab}
            onChange={v => (setSubTab(v), setPageIndex(1), setPage(0))}
          />
        </div> */}
        <SearchComponent searchString={searchString} setSearchString={setSearchString} postClear={postSearch} postSearch={postSearch} />
      </div>
      {/* table */}
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ minHeight: `50%`, marginTop: '10px', height: isShowWoDetails ? 'calc(100% - 370px)' : 'calc(100% - 240px)' }}>
        <TableComponent loading={loading} columns={columns} data={get(data, 'timeMaterialsList', [])} />
        {data.listsize !== 0 && !loading && (
          <div style={{ backgroundColor: '#F5F5F5', position: 'relative', padding: '15px', minWidth: '847px' }}>
            <div style={{ position: 'absolute', right: '10%', top: '-2px' }}>
              <LabelVal inline label='Total Amount' value={<span className='text-bold'>${formateNumber(get(data, 'sumOfAllMarkupAmount', 0))}</span>} />
            </div>
          </div>
        )}
      </div>
      {!isEmpty(get(data, 'timeMaterialsList', [])) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={get(data, 'listsize', 0)} rowsPerPage={pageSize} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
      {isOpenAddTimeMaterials && <AddTimeMaterials open={isOpenAddTimeMaterials} onClose={() => setOpenAddTimeMaterials(false)} woId={woId} reFetch={reFetch} countUpdate={countUpdate} setPage={setPage} setPageIndex={setPageIndex} />}
      {isOpenEditTimeMaterials && <AddTimeMaterials open={isOpenEditTimeMaterials} onClose={() => setOpenEditTimeMaterials(false)} woId={woId} anchorObj={anchorObj} isEdit reFetch={reFetch} />}
      <DialogPrompt title='Delete Time & Material' text='Are you sure you want to delete this Time & Material?' open={isOpenDeleteTimeMaterials} ctaText='Delete' actionLoader={deleteLoading} action={handleDelete} handleClose={() => setOpenDeleteTimeMaterials(false)} />
    </>
  )
}

export default TimeMaterials
