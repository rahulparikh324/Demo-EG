import { useEffect, useRef, useState } from 'react'

import { MinimalButton } from 'components/common/buttons'
import AddIcon from '@material-ui/icons/Add'
import AddGroup from './add-group'
import SearchComponent from 'components/common/search'
import { get, isEmpty, isEqual } from 'lodash'
import { Box, Button, CircularProgress, Divider, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, Typography } from '@material-ui/core'
import health from 'Services/health'
import useFetchData from 'hooks/fetch-data'
import enums from 'Constants/enums'
import RotateLeftSharpIcon from '@material-ui/icons/RotateLeftSharp'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined'
import EditOutlinedIcon from '@material-ui/icons/EditOutlined'
import { nanoid } from 'nanoid'
import DialogPrompt from 'components/DialogPrompt'
import { snakifyKeys } from 'helpers/formatters'
import { Toast } from 'Snackbar/useToast'
import FilterListIcon from '@material-ui/icons/FilterList'

const Health = () => {
  const style = { fontSize: '12px', fontWeight: 400, height: '35px' }
  const tabelHeader = { backgroundColor: 'transparent !important' }

  const statusFilterList = [
    { label: 'All', value: [enums.HEALTH.ALL], color: '#FFFFFF' },
    { label: 'N/A', value: [enums.HEALTH.NA], color: '#FFFFFF', borderColor: '#D9D9D9' },
    { label: 'Acceptable', value: [enums.HEALTH.ACCEPTABLE], color: '#41BE73' },
    { label: 'Alert', value: [enums.HEALTH.ALERT], color: '#F2C14A' },
    { label: 'Danger/Obsolete', value: [enums.HEALTH.DANGER], color: '#FA0B0B' },
  ]

  const [isOpenAddDrawer, setOpenAddDrawer] = useState(false)
  const [searchString, setSearchString] = useState('')
  const [list, setList] = useState([])
  const [statusFilter, setStatusFilter] = useState(statusFilterList[0].value)
  const [deleteAssetGroup, setDeleteAssetGroup] = useState(false)
  const [anchorObj, setAnchorObj] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isExpand, setExpand] = useState(true)

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [pageIndex, setPageIndex] = useState(1)

  const payload = { pagesize: pageSize, pageindex: pageIndex, health_type: statusFilter[0], search_string: searchString }
  const { loading, data: assetGroupData, reFetch } = useFetchData({ fetch: health.getAllAssetGroupsList, payload, formatter: d => get(d, 'data', []) })

  const handleChangePage = (event, newPage) => {
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
    setStatusFilter(statusFilterList[0].value)
  }

  const handleToggle = (rowData, classData) => {
    const index = list.findIndex(val => val.assetGroupId === rowData.assetGroupId)
    if (classData) {
      if (index !== -1) {
        const newList = [...list]
        newList[index].classList = Object.entries(newList[index].classList).map(([key, subClassData]) => {
          if (subClassData.assetSubList[0].inspectiontemplateAssetClassId === classData.assetSubList[0].inspectiontemplateAssetClassId) {
            return { ...subClassData, isExpand: !subClassData.isExpand }
          }
          return subClassData
        })
        setList(newList)
      }
    } else {
      if (index !== -1) {
        const newList = [...list]
        newList[index] = {
          ...newList[index],
          isExpand: !newList[index].isExpand,
        }
        setList(newList)
      }
    }
  }

  const handleExpandCollapse = () => {
    const allExpanded = list.every(data => data.isExpand)
    setList(
      list.map(data => ({
        ...data,
        classList: Object.entries(get(data, 'classList', {})).map(([key, classData]) => ({ ...classData, isExpand: !allExpanded })),
        isExpand: !allExpanded,
      }))
    )
    setExpand(!allExpanded)
  }

  const handleEditAssetGroup = data => {
    setAnchorObj(data)
    setOpenAddDrawer(true)
  }

  const handleDeleteGroup = async () => {
    setIsLoading(true)
    try {
      const playload = { assetGroupId: anchorObj.assetGroupId, isDeleted: true }
      const res = await health.addUpdateAssetGroup(snakifyKeys(playload))
      if (res.success > 0) {
        Toast.success('Asset Group deleted successfully !')
        setList(prevList => prevList.filter(item => item.assetGroupId !== anchorObj.assetGroupId))
      } else Toast.error(res.message)
    } catch (error) {
      Toast.error('Something went wrong !')
    }

    setIsLoading(false)
    setDeleteAssetGroup(false)
    setAnchorObj({})
  }

  const handleAction = async (event, data) => {
    event.stopPropagation()
    setAnchorObj(data)
    setDeleteAssetGroup(true)
  }

  const handleAssetGroupCreated = async newAssetGroupId => {
    setAnchorObj({})
    reFetch()
  }

  const handleAssetGroupClose = () => {
    setAnchorObj({})
    setOpenAddDrawer(false)
  }

  useEffect(() => {
    if (assetGroupData) {
      const list = get(assetGroupData, 'list', [])
      if (isEmpty(list)) {
        setList([])
      } else {
        list.forEach(item => {
          item.isExpand = isExpand
          item.healthAvarage = 0
          item.validHealthCount = 0
          let classList = get(item, 'assetList', [])
          if (!isEmpty(classList)) {
            classList.forEach(dd => {
              if (dd?.assetHealthIndex && dd?.assetHealthIndex > 0) {
                item.healthAvarage += dd.assetHealthIndex
                item.validHealthCount += 1
              }
            })

            item.classList = classList.reduce((acc, asset) => {
              const key = asset?.inspectiontemplateAssetClassId
              const assetHealthTitle = JSON.parse(asset?.assetHealthJson)
              if (!acc[key]) {
                acc[key] = {
                  isExpand: true,
                  assetSubList: [],
                  healthAvarage: 0,
                  validHealthCount: 0,
                }
              }

              if (asset?.assetHealthIndex && asset?.assetHealthIndex > 0) {
                acc[key].healthAvarage += asset.assetHealthIndex
                acc[key].validHealthCount += 1
              }

              acc[key].assetSubList.push({ ...asset, assetHealthJson: assetHealthTitle })
              return acc
            }, {})
          }
        })

        setList(list)
      }
    } else {
      setList([])
    }
  }, [assetGroupData])

  const formatKey = key => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/\bIr\b/, 'IR')
  }

  const getColorCodeValue = (value, alpha = 1) => {
    let color = ''
    switch (true) {
      case value >= 0.9 && value <= 1.0:
        color = `rgba(65, 190, 115, ${alpha})`
        break
      case value >= 0.8 && value < 0.9:
        color = `rgba(242, 193, 74, ${alpha})`
        break
      case value < 0.8:
        color = `rgba(250, 11, 11, ${alpha})`
        break
    }
    return color
  }

  const getColorCodeName = (value, alpha) => {
    let color = '#FFFFFF'
    switch (value) {
      case statusFilterList[2].label:
        color = '#41BE73'
        break
      case statusFilterList[3].label:
        color = '#F2C14A'
        break
      case statusFilterList[4].label:
        color = '#FA0B0B'
        break
    }
    return color
  }

  const GetColorCodeWithHealthData = ({ value }) => {
    return (
      <div
        style={{
          width: '15px',
          height: '15px',
          background: getColorCodeName(value, 1),
          border: value ? 'none' : '1px solid #D9D9D9',
        }}
      />
    )
  }

  const StatusSelectPopup = ({ options, baseClassName, statusFilterValues, onChange, style }) => {
    const [open, setOpen] = useState(false)
    const selectedObj = options.find(d => isEqual(d.value, statusFilterValues)) || options.find(d => isEmpty(d.value))
    const ref = useRef(null)
    const handleClickOutside = event => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false)
    }
    useEffect(() => {
      document.addEventListener('click', handleClickOutside, true)
      return () => document.removeEventListener('click', handleClickOutside, true)
    }, [])

    const getCurrentFilter = statusFilterList.find(d => d.value[0] === statusFilter[0])

    return (
      <div className={`filter-div ${baseClassName}`} style={style}>
        <div onClick={() => setOpen(true)} className='d-flex align-items-center' style={{ cursor: 'pointer' }}>
          <Button className='nf-buttons' size='small' startIcon={<FilterListIcon fontSize='small' />} variant='contained' color='primary' onClick={() => setOpen(true)} disableElevation>
            {getCurrentFilter.value[0] && (
              <div
                style={{
                  backgroundColor: getCurrentFilter.color,
                  border: getCurrentFilter.borderColor ? `1px solid ${getCurrentFilter.borderColor}` : 'none',
                  width: '15px',
                  height: '15px',
                  marginRight: '10px',
                }}
              />
            )}
            {getCurrentFilter.label}
          </Button>
        </div>
        {open && (
          <div id='_menu-content' ref={ref} style={{ top: '35px', left: 0, maxHeight: '200px', width: 'max-content', display: 'flex', flexDirection: 'column', fontWeight: 700 }}>
            {options.map(d => (
              <div
                id='_menu-item'
                key={d.value}
                onClick={() => {
                  onChange(d.value)
                  setOpen(false)
                }}
                name={d.value}
                style={{ borderRadius: '4px', display: 'flex', padding: '5px 5px', alignItems: 'center !imporntant', height: '30px', cursor: 'pointer', background: !isEmpty(selectedObj) && selectedObj.label === d.label ? '#e9e9e9' : 'none' }}
              >
                {d.label !== 'All' && (
                  <div
                    style={{
                      backgroundColor: d.color,
                      border: d.borderColor ? `1px solid ${d.borderColor}` : 'none',
                      width: '15px',
                      height: '15px',
                      marginRight: '10px',
                    }}
                  />
                )}
                {d.label}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', width: '100%', p: 2, backgroundColor: '#fff' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <StatusSelectPopup options={statusFilterList.filter(item => item.value[0] !== statusFilterList[1].value[0])} statusFilterValues={statusFilter} onChange={d => setStatusFilter(d)} />
          <Divider orientation='vertical' flexItem style={{ margin: '0px 10px' }} />
          <MinimalButton onClick={() => setOpenAddDrawer(true)} text='Add Asset Group' size='small' startIcon={<AddIcon fontSize='small' />} variant='contained' color='primary' />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SearchComponent placeholder='Search' searchString={searchString} setSearchString={setSearchString} />
          <MinimalButton text='Reset Filter' size='small' onClick={resetFilter} startIcon={<RotateLeftSharpIcon fontSize='small' />} disabled={statusFilterList[0].value[0] === statusFilter[0]} variant='contained' color='primary' style={{ marginLeft: '10px' }} />
          <MinimalButton onClick={handleExpandCollapse} text={list.every(item => item.isExpand) ? 'Collapse All' : 'Expand All'} size='small' variant='contained' color='primary' style={{ marginLeft: '10px' }} />
        </Box>
      </Box>
      {loading ? (
        <Box sx={{ mt: 22, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size={32} thickness={5} />
        </Box>
      ) : (
        <>
          <div className='table-responsive dashboardtblScroll' id='style-1' style={{ marginTop: '10px', width: '100%', height: 'calc(100% - 80px)' }}>
            {isEmpty(list) && !loading ? (
              <div className='Pendingtbl-no-datafound' style={{ marginTop: '60px' }}>
                No data found
              </div>
            ) : (
              list.map(d => (
                <Box
                  key={d.id}
                  className='label-container'
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '5px',
                    backgroundColor: d.validHealthCount > 0 ? `${getColorCodeValue((d.healthAvarage / d.validHealthCount).toFixed(2), 0.1)}` : 'rgba(225, 225, 225, 0.30)',
                    mb: '10px',
                    p: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {d.isExpand ? <ExpandMoreIcon fontSize='small' onClick={() => handleToggle(d, null)} /> : <ChevronRightIcon fontSize='small' onClick={() => handleToggle(d, null)} />}
                      <Typography variant='subtitle2' className='text-black-medium-bold' style={{ marginLeft: '5px' }}>
                        {get(d, 'assetGroupName', 'N/A')}
                      </Typography>
                      <EditOutlinedIcon size='small' className='hover-lable-button' style={{ marginLeft: '15px', width: '18px', height: '18px', cursor: 'pointer' }} onClick={() => handleEditAssetGroup(d)} />
                      <DeleteOutlineOutlinedIcon size='small' className='hover-lable-button' color='error' style={{ marginLeft: '4px', width: '18px', height: '18px', cursor: 'pointer' }} onClick={e => handleAction(e, d)} />
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#fff',
                        borderRadius: '5px',
                        p: 1,
                        mr: 1,
                      }}
                    >
                      <Typography variant='subtitle2' className='text-black-medium-bold'>
                        Group Health:
                      </Typography>
                      <Typography variant='subtitle2' className='text-black-medium-bold' style={{ marginLeft: '2px', color: d.validHealthCount > 0 ? `${getColorCodeValue((d.healthAvarage / d.validHealthCount).toFixed(2))}` : '' }}>
                        {d.validHealthCount > 0 ? (d.healthAvarage / d.validHealthCount).toFixed(2) : 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box style={{ width: '100%' }}>
                    {d.isExpand &&
                      (isEmpty(get(d, 'classList', [])) ? (
                        <div className='not-found-text'>No assets added to group</div>
                      ) : (
                        Object.entries(get(d, 'classList', [])).map(([key, classData]) => (
                          <Box
                            key={key}
                            sx={{
                              borderRadius: '5px',
                              marginTop: '5px',
                              padding: '10px 5px 5px 10px',
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {classData.isExpand ? <ExpandMoreIcon fontSize='small' onClick={() => handleToggle(d, classData)} /> : <ChevronRightIcon fontSize='small' onClick={() => handleToggle(d, classData)} />}
                                <Typography className='text-black-reguler-bold' style={{ marginLeft: '5px' }}>
                                  {get(classData, 'assetSubList', [])[0]?.assetClassCode ? get(classData, 'assetSubList', [])[0]?.assetClassCode : 'N/A'}
                                </Typography>
                              </Box>
                              <Box sx={{ borderRadius: '5px', background: '#fff', padding: '5px 10px', display: 'flex', alignItems: 'center' }}>
                                <Typography variant='subtitle2' className='text-black-reguler-bold'>
                                  Class Health:
                                </Typography>
                                <Typography variant='subtitle2' className='text-black-reguler-bold' style={{ marginLeft: '2px', color: classData.validHealthCount > 0 ? `${getColorCodeValue((classData.healthAvarage / classData.validHealthCount).toFixed(2))}` : '' }}>
                                  {classData.validHealthCount > 0 ? (classData.healthAvarage / classData.validHealthCount).toFixed(2) : 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                            <Box mt={1}>
                              {classData.isExpand && get(classData, 'assetSubList', [])[0].assetHealthJson && (
                                <>
                                  <Table size='small'>
                                    <TableHead>
                                      <TableRow>
                                        <TableCell sx={tabelHeader}>Asset</TableCell>
                                        <TableCell sx={tabelHeader}>Health Score</TableCell>
                                        {Object.keys(get(classData, 'assetSubList', [])[0].assetHealthJson).map(key => (
                                          <TableCell key={nanoid()} sx={tabelHeader}>
                                            {formatKey(key)}
                                          </TableCell>
                                        ))}
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {get(classData, 'assetSubList', []).map(data => (
                                        <TableRow key={nanoid()}>
                                          <TableCell style={{ ...style, width: '25%' }}>{!isEmpty(data?.name) ? data.name : 'N/A'}</TableCell>
                                          <TableCell style={{ ...style, color: data?.assetHealthIndex ? `${getColorCodeValue(data?.assetHealthIndex)}` : '' }}>{data?.assetHealthIndex ? data.assetHealthIndex : 'N/A'}</TableCell>
                                          {data.assetHealthJson ? Object.values(data?.assetHealthJson).map(key => <TableCell>{<GetColorCodeWithHealthData value={key} />}</TableCell>) : Array.from({ length: 4 }).map((_, index) => <TableCell key={index}>{<GetColorCodeWithHealthData value={null} />}</TableCell>)}
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </>
                              )}
                            </Box>
                          </Box>
                        ))
                      ))}
                  </Box>
                </Box>
              ))
            )}
          </div>
          {!isEmpty(list) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={get(assetGroupData, 'count', 0)} rowsPerPage={pageSize} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
        </>
      )}
      {isOpenAddDrawer && <AddGroup obj={anchorObj} isEdit onAssetGroupCreated={handleAssetGroupCreated} open={isOpenAddDrawer} onClose={handleAssetGroupClose} isFromAssetGroup={true} />}
      <DialogPrompt title='Asset Group' text='Are you sure you want to delete the asset group ?' open={deleteAssetGroup} ctaText='Delete' actionLoader={isLoading} action={handleDeleteGroup} handleClose={() => setDeleteAssetGroup(false)} />
    </Box>
  )
}

export default Health
