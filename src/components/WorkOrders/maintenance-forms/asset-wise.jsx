import React, { useState, useEffect } from 'react'

import { isEmpty, omit, get, uniqBy, isNil } from 'lodash'
import enums from 'Constants/enums'

import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import CloseIcon from '@material-ui/icons/Close'
import FilterListIcon from '@material-ui/icons/FilterList'
import { StatusComponent, AssetTypeIcon } from 'components/common/others'
import { getDuplicateQRs, getStatus } from 'components/WorkOrders/onboarding/utils'
import CircularProgress from '@material-ui/core/CircularProgress'
import { Box, Tooltip, Typography, withStyles } from '@material-ui/core'

import { MinimalButton } from 'components/common/buttons'

import { nanoid } from 'nanoid'

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

const AssetHeader = ({ isQuote }) => {
  return (
    <div style={{ display: 'flex', background: '#fafafa', paddingLeft: '20px' }}>
      <div className='text-bold px-3 py-2 border-bottom' style={{ minWidth: '150px', width: isQuote ? '33%' : '20%' }}>
        WO Line Item#
      </div>
      <div className='text-bold px-3 py-2 border-bottom' style={{ minWidth: '150px', width: isQuote ? '33%' : '20%' }}>
        Asset Class
      </div>
      <div className='text-bold px-3 py-2 border-bottom' style={{ minWidth: '150px', width: isQuote ? '33%' : '20%' }}>
        Category
      </div>
      <div className='text-bold px-3 py-2 border-bottom' style={{ minWidth: '150px', width: isQuote ? '33%' : '20%' }}>
        Submitted By
      </div>
      {!isQuote && (
        <div className='text-bold px-3 py-2 border-bottom' style={{ minWidth: '150px', width: '20%' }}>
          Status
        </div>
      )}
    </div>
  )
}

const AssetComponentLine = ({ data, index = 0, color, label, onRowClick, fetchingForm, isQuote, duplicateQRs }) => {
  const inspectionTypes = [
    { label: 'NETA Inspection', value: enums.MWO_INSPECTION_TYPES.INSPECTION },
    { label: 'Install / Add', value: enums.MWO_INSPECTION_TYPES.ONBOARDING },
    { label: 'Repair', value: enums.MWO_INSPECTION_TYPES.REPAIR },
    { label: 'Replace', value: enums.MWO_INSPECTION_TYPES.REPLACE },
    { label: 'General Issue Resolution', value: enums.MWO_INSPECTION_TYPES.TROUBLE_CALL_CHECK },
    { label: 'Issue', value: enums.MWO_INSPECTION_TYPES.ISSUE },
    { label: 'Preventative Maintenance', value: enums.MWO_INSPECTION_TYPES.PM },
  ]
  const renderInspectionType = (text, x) => {
    const type = inspectionTypes.find(d => d.value === text)
    if (isEmpty(type)) return 'N/A'
    if (type.value === enums.MWO_INSPECTION_TYPES.PM) return get(x, 'asset_pm_title', 'N/A')
    return type.label
  }

  const handleOnClick = d => {
    onRowClick('VIEW', { ...omit(d, 'children'), wOcategorytoTaskMapping_id: d.wOcategorytoTaskMapping_id })
  }

  return (
    <HtmlTooltip placement='top' title={duplicateQRs.has(data.qR_code) ? 'Duplicate QR code in this WO line' : ''}>
      <div key={nanoid()} onClick={() => handleOnClick(data)} className='table-with-row-click' style={{ fontSize: '12px', display: 'flex', paddingLeft: '20px', background: duplicateQRs.has(data.qR_code) ? '#ffebeb' : '#fafafa' }}>
        <div style={{ minWidth: '150px', width: isQuote ? '33%' : '20%' }} className='border-bottom px-3  py-2'>
          {`L${index + 1}`}
        </div>
        <div className='px-3 py-2 border-bottom' style={{ minWidth: '150px', width: isQuote ? '33%' : '20%' }}>
          {!isEmpty(data.asset_class_name) ? data.asset_class_name : 'N/A'}
        </div>
        <div className='px-3 py-2 border-bottom' style={{ minWidth: '150px', width: isQuote ? '33%' : '20%' }}>
          {renderInspectionType(data.inspection_type, data)}
        </div>
        <div className='px-3 py-2 border-bottom' style={{ minWidth: '150px', width: isQuote ? '33%' : '20%' }}>
          {!isEmpty(data.technician_name) ? data.technician_name : 'N/A'}
        </div>
        {!isQuote && (
          <div className='px-3 py-2 border-bottom' style={{ minWidth: '150px', width: '20%' }}>
            <StatusComponent color={color} label={label} size='small' />
          </div>
        )}
        {fetchingForm === data.wo_inspectionsTemplateFormIOAssignment_id ? <CircularProgress size={20} thickness={5} style={{ marginRight: '6px', marginTop: '6px' }} /> : ''}
      </div>
    </HtmlTooltip>
  )
}

const AccordianRow = ({ data, onRowClick, handleToggle, fetchingForm, isQuote, duplicateQRs }) => {
  return (
    <>
      {/* top components line */}
      <div style={{ fontSize: '12px', display: 'flex' }} key={nanoid()}>
        <div className='d-flex align-items-center border-bottom' style={{ cursor: 'pointer', width: '100%', minWidth: '750px' }}>
          {data.isExpand ? <ExpandMoreIcon fontSize='small' onClick={() => handleToggle(data)} /> : <ChevronRightIcon fontSize='small' onClick={() => handleToggle(data)} />}
          <div className='px-1 py-2 d-flex'>
            <AssetTypeIcon type={data.asset_class_type} /> {!isEmpty(data.name) ? data.name : 'NA'}
          </div>
        </div>
      </div>
      {data.isExpand && (
        <>
          <AssetHeader isQuote={isQuote} />
          {get(data, 'children', []).map((topAsset, index) => {
            const { color, label } = getStatus(topAsset.status_id)
            return (
              <div key={nanoid()}>
                <AssetComponentLine key={nanoid()} data={topAsset} index={index} color={color} label={label} onRowClick={onRowClick} fetchingForm={fetchingForm} isQuote={isQuote} duplicateQRs={duplicateQRs} />
              </div>
            )
          })}

          {/* sub component line */}
          {!isEmpty(data.subLevelComponent) && (
            <>
              <div className='d-flex align-items-center border-bottom' style={{ cursor: 'pointer', minWidth: '750px', marginLeft: '20px' }} key={nanoid()}>
                <div className='px-3 py-2 text-bold'>Sub Components (OCP's)</div>
              </div>
              {get(data, 'subLevelComponent', []).map((subAsset, index) => (
                <>
                  <div style={{ fontSize: '12px', display: 'flex', marginLeft: '30px' }} key={nanoid()}>
                    <div className='d-flex align-items-center border-bottom' style={{ cursor: 'pointer', width: '100%', minWidth: '750px' }}>
                      {subAsset.isExpand ? <ExpandMoreIcon fontSize='small' onClick={() => handleToggle(subAsset)} /> : <ChevronRightIcon fontSize='small' onClick={() => handleToggle(subAsset)} />}
                      <div className='px-1 py-2 d-flex'>
                        <AssetTypeIcon type={subAsset.asset_class_type} /> {!isEmpty(subAsset.name) ? subAsset.name : 'NA'}
                      </div>
                    </div>
                  </div>
                  {subAsset.isExpand && (
                    <>
                      <div style={{ paddingLeft: '15px' }}>{<AssetHeader isQuote={isQuote} />}</div>
                      {get(subAsset, 'children', []).map((child, index) => {
                        const { color, label } = getStatus(child.status_id)
                        return (
                          <div key={nanoid()}>
                            <div style={{ paddingLeft: '15px' }} key={nanoid()}>
                              <AssetComponentLine key={nanoid()} data={child} index={index} color={color} label={label} onRowClick={onRowClick} fetchingForm={fetchingForm} isQuote={isQuote} duplicateQRs={duplicateQRs} />
                            </div>
                          </div>
                        )
                      })}
                      {/* <AssetSubComponent data={child} index={index} onRowClick={onRowClick} key={nanoid()} handleToggle={handleToggle} fetchingForm={fetchingForm} /> */}
                    </>
                  )}
                </>
              ))}
            </>
          )}
        </>
      )}
    </>
  )
}

const AssetSubComponent = ({ data, index, onRowClick, handleToggle, fetchingForm }) => {
  const { color, label } = getStatus(data.status_id)
  return (
    <div key={nanoid()}>
      <div style={{ fontSize: '12px', display: 'flex', paddingLeft: '10px' }}>
        <div className='d-flex align-items-center border-bottom' style={{ cursor: 'pointer', width: '100%', minWidth: '750px', marginLeft: '20px' }}>
          {data.isExpand ? <ExpandMoreIcon fontSize='small' onClick={() => handleToggle(data)} /> : <ChevronRightIcon fontSize='small' onClick={() => handleToggle(data)} />}
          <div className='px-1 py-2 d-flex'>
            <AssetTypeIcon type={data.asset_class_type} /> {!isEmpty(data.name) ? data.name : 'N/A'}
          </div>
        </div>
      </div>
      {data.isExpand && (
        <>
          <div style={{ paddingLeft: '15px' }}>{<AssetHeader />}</div>
          <div style={{ paddingLeft: '15px' }} key={nanoid()}>
            <AssetComponentLine key={nanoid()} data={data} index={index} color={color} label={label} onRowClick={onRowClick} fetchingForm={fetchingForm} />
          </div>
        </>
      )}
    </div>
  )
}

const AssetWise = ({ data, onRowClick, fetchingForm, isShowWoDetails, isQuote, errorList = [], errorFlag = false }) => {
  const [list, setList] = useState([])
  const [isExpand, setExpand] = useState(true)
  const [noTopLevelSubComponent, setNoTopLevelSubComponent] = useState([])
  const [errorCount, setErrorCount] = useState([])
  const [errorCountFlag, setErrorCountFlag] = useState(errorFlag)

  useEffect(() => {
    const list = data.map(d => ({ ...d, name: d.asset_name || d.assigned_asset_name, isExpand: true }))
    const topLevel = list.filter(d => d.component_level_type_id === enums.COMPONENT_TYPE.TOP_LEVEL)
    const subLevel = list.filter(d => d.component_level_type_id === enums.COMPONENT_TYPE.SUB_COMPONENT)
    const noLevel = list.filter(d => d.component_level_type_id === 0)

    const topLevelIds = []

    topLevel.forEach(d => {
      if (!isEmpty(d.asset_id)) topLevelIds.push(d.asset_id)
      if (!isEmpty(d.woonboardingassets_id)) topLevelIds.push(d.woonboardingassets_id)
      if (!isEmpty(d.assigned_asset_id)) topLevelIds.push(d.assigned_asset_id)
    })

    const noTopLevelSub = subLevel.filter(sub => !topLevelIds?.includes(sub.toplevelcomponent_asset_id))
    const noLevelTopCombination = [...noTopLevelSub, ...noLevel]

    const noLevelOccurances = []

    noLevelTopCombination.forEach(asset => {
      let filteredNodes = [...noLevelTopCombination.filter(d => asset.asset_id?.includes(d.asset_id))]
      if (isEmpty(filteredNodes)) {
        filteredNodes = noLevelTopCombination.filter(d => asset.woonboardingassets_id === d.woonboardingassets_id)
      }
      const childrenNodesNolevel = []
      if (!noLevelOccurances.includes(asset.asset_id || asset.woonboardingassets_id)) {
        noLevelOccurances.push(asset.asset_id || asset.woonboardingassets_id)
        filteredNodes.forEach(d => {
          childrenNodesNolevel.push({ ...d, subLevelComponent: [] })
        })
      }
      asset.children = childrenNodesNolevel.length ? childrenNodesNolevel : []
      asset.isExpand = true
    })

    setNoTopLevelSubComponent(uniqBy(noLevelTopCombination, item => (isNil(item.asset_id) ? item.woonboardingassets_id : item.asset_id)))

    const subLevelMapping = {}

    topLevel.forEach(top => {
      subLevelMapping[top.woonboardingassets_id] = subLevel.filter(sub => [top.woonboardingassets_id, top.asset_id, top.assigned_asset_id].includes(sub.toplevelcomponent_asset_id) && !isEmpty(sub.toplevelcomponent_asset_id))
    })

    const topLevelWithSubLevel = topLevel.map(top => ({
      ...top,
      subLevelComponent: subLevelMapping[top.woonboardingassets_id] || [],
    }))

    const nodeOccurances = []
    const mainAssetList = [...topLevelWithSubLevel]
    topLevelWithSubLevel.forEach(asset => {
      let filteredNodes = [...mainAssetList.filter(d => asset.asset_id?.includes(d.asset_id))]
      if (isEmpty(filteredNodes)) {
        filteredNodes = mainAssetList.filter(d => asset.woonboardingassets_id === d.woonboardingassets_id)
      }
      const childrenNodes = []
      if (!nodeOccurances.includes(asset.asset_id || asset.woonboardingassets_id)) {
        nodeOccurances.push(asset.asset_id || asset.woonboardingassets_id)
        filteredNodes.forEach(d => {
          childrenNodes.push({ ...d, subLevelComponent: [] })
        })
      }
      asset.children = childrenNodes.length ? childrenNodes : []
      asset.isExpand = true

      //handle sublevelcomponents
      const subNodeOccurances = []
      if (!isEmpty(asset.subLevelComponent)) {
        const subLevelComponentList = [...asset.subLevelComponent]
        asset.subLevelComponent.forEach(sub => {
          let filteredNodes = [...subLevelComponentList.filter(d => sub.asset_id?.includes(d.asset_id))]

          if (isEmpty(filteredNodes)) {
            filteredNodes = subLevelComponentList.filter(d => sub.woonboardingassets_id === d.woonboardingassets_id)
          }
          const subChildrenNodes = []
          if (!subNodeOccurances.includes(sub.asset_id || sub.woonboardingassets_id)) {
            subNodeOccurances.push(sub.asset_id || sub.woonboardingassets_id)

            filteredNodes.forEach(d => {
              subChildrenNodes.push({ ...d, children: [] })
            })
          }

          sub.children = subChildrenNodes.length ? subChildrenNodes : []
          sub.expand = true
        })
        asset.subLevelComponent = uniqBy(asset.subLevelComponent, item => (isNil(item.asset_id) ? item.woonboardingassets_id : item.asset_id))
      }
    })

    setList(uniqBy(topLevelWithSubLevel, item => (isNil(item.asset_id) ? item.woonboardingassets_id : item.asset_id)))
  }, [errorCountFlag])

  useEffect(() => {
    if (!isEmpty(errorList)) {
      let error = []
      if (!isEmpty(list)) {
        list.forEach(d => {
          if (duplicateQRs.has(d.qR_code)) {
            error = [...error, d]
          }
        })
      }
      setErrorCount(error)
    } else {
      setErrorCount([])
    }
  }, [errorList])

  useEffect(() => {
    if (errorCountFlag) {
      let error = []
      if (!isEmpty(list)) {
        list.forEach(d => {
          if (duplicateQRs.has(d.qR_code)) {
            error = [...error, d]
          }
        })
      }
      setList(error)
    }
  }, [errorCountFlag])

  const handleToggle = rowData => {
    const newData = list.map(val => {
      if (!isEmpty(val.subLevelComponent)) {
        val.subLevelComponent.forEach(sub => {
          if (rowData.woonboardingassets_id === sub.woonboardingassets_id && rowData.asset_id === sub.asset_id && rowData.assigned_asset_id === sub.assigned_asset_id) {
            sub.isExpand = !sub.isExpand
          }
        })
      }
      if (rowData.woonboardingassets_id === val.woonboardingassets_id && rowData.asset_id === val.asset_id && rowData.assigned_asset_id === val.assigned_asset_id) {
        return { ...val, isExpand: !val.isExpand, subLevelComponent: [...val.subLevelComponent] }
      }
      // })

      if (rowData.woonboardingassets_id == val.woonboardingassets_id && rowData.asset_id == val.asset_id && rowData.assigned_asset_id == val.assigned_asset_id) {
        return { ...val, isExpand: !val.isExpand }
      } else {
        return val
      }
    })
    setList(newData)
  }

  const handleSubToggle = rowData => {
    const newSubData = noTopLevelSubComponent.map(sub => {
      if (rowData.woonboardingassets_id == sub.woonboardingassets_id && rowData.asset_id == sub.asset_id && rowData.assigned_asset_id == sub.assigned_asset_id) {
        return { ...sub, isExpand: !sub.isExpand }
      } else {
        return sub
      }
    })
    setNoTopLevelSubComponent(newSubData)
  }

  const handleExpandCollapse = () => {
    const allExpanded = list.every(data => data.isExpand) && noTopLevelSubComponent.every(data => data.isExpand)

    setList(
      list.map(data => ({
        ...data,
        subLevelComponent: get(data, 'subLevelComponent', []).map(item => ({
          ...item,
          isExpand: !allExpanded,
        })),
        isExpand: !allExpanded,
      }))
    )
    setExpand(!allExpanded)
    setNoTopLevelSubComponent(
      noTopLevelSubComponent.map(data => ({
        ...data,
        isExpand: !allExpanded,
      }))
    )
  }

  const duplicateQRs = getDuplicateQRs(list, true)

  const handleErrorCountClick = event => {
    setErrorCountFlag(pre => {
      if (pre) {
        setErrorCountFlag(false)
        setErrorCount([])
      }
      return !pre
    })
  }

  const ErrorCount = ({ count }) => {
    return (
      <Box className='filter-div' style={{ top: '-34px' }} onClick={handleErrorCountClick}>
        <Box className='filter-chip' style={{ background: '#ffebeb', display: 'flex', alignItems: 'center', marginRight: '10px', minHeight: '30px', border: '1px solid red' }}>
          <Typography className='text-black-reguler-bold'>{count}</Typography>
          <Typography className='text-black-reguler-bold' style={{ marginLeft: '5px' }}>
            Errors Found
          </Typography>
          {errorCountFlag ? <CloseIcon fontSize='small' style={{ width: '18px', height: '18px', marginLeft: '5px' }} /> : <FilterListIcon fontSize='small' style={{ width: '18px', height: '18px', marginLeft: '5px' }} />}
        </Box>
      </Box>
    )
  }

  return (
    <>
      <div className='d-flex flex-row-reverse' style={{ position: 'relative' }}>
        <MinimalButton onClick={handleExpandCollapse} text={list.every(item => item.isExpand) && noTopLevelSubComponent.every(item => item.isExpand) ? 'Collapse All' : 'Expand All'} size='small' variant='contained' color='primary' baseClassName='nf-buttons' disabled={isEmpty(list) && isEmpty(noTopLevelSubComponent)} style={{ top: '-34px' }} />
        {!isEmpty(errorCount) && <ErrorCount count={errorCount.length} />}
      </div>
      <div style={{ marginTop: '10px', overflowX: 'auto', overflowY: 'auto', height: isShowWoDetails ? 'calc(100vh - 420px)' : 'calc(100vh - 320px)' }} id='style-1'>
        <div style={{ display: 'flex', background: '#fafafa' }}>
          <div className='text-bold border-bottom' style={{ minWidth: '750px', width: '100%', padding: '5px 24px 5px 16px' }}>
            Identification
          </div>
        </div>
        {isEmpty(list) ? (
          <div className='d-flex justify-content-center align-items-center text-bold' style={{ height: !isEmpty(list) && '80%', opacity: 0.5 }}>
            {isEmpty(noTopLevelSubComponent) && <div className='mt-5'>No data found</div>}
          </div>
        ) : (
          list.map(d => <AccordianRow key={nanoid()} data={d} onRowClick={onRowClick} handleToggle={handleToggle} fetchingForm={fetchingForm} isQuote={isQuote} duplicateQRs={duplicateQRs} />)
        )}
        {!isEmpty(noTopLevelSubComponent) && (
          <>
            <div style={{ display: 'flex', background: '#fafafa' }}>
              <div className='text-bold border-bottom' style={{ minWidth: '750px', width: '100%', padding: '5px 24px 5px 0px' }}>
                {isExpand ? <ExpandMoreIcon fontSize='small' onClick={() => setExpand(!isExpand)} /> : <ChevronRightIcon fontSize='small' onClick={() => setExpand(!isExpand)} />}
                Top-Level Component not present in this workorder
              </div>
            </div>
            <div style={{ marginLeft: '20px' }}>{isExpand && noTopLevelSubComponent.map(d => <AccordianRow key={nanoid()} data={d} onRowClick={onRowClick} handleToggle={handleSubToggle} fetchingForm={fetchingForm} isQuote={isQuote} />)}</div>
          </>
        )}
      </div>
    </>
  )
}

export default AssetWise
