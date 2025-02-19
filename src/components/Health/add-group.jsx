import { useEffect, useRef, useState } from 'react'

import * as yup from 'yup'
import { validateSchema } from 'helpers/schemaValidation'
import { get, isEmpty, orderBy } from 'lodash'

import Drawer from '@material-ui/core/Drawer'
import CloseIcon from '@material-ui/icons/Close'
import { FormTitle } from 'components/Maintainance/components'
import { MinimalInput, MinimalTextArea } from 'components/Assets/components'
import { MinimalButton, MinimalButtonGroup } from 'components/common/buttons'
import { criticalityOptionsForAssetGroup } from 'components/WorkOrders/onboarding/utils'
import enums from 'Constants/enums'
import { snakifyKeys } from 'helpers/formatters'
import { Toast } from 'Snackbar/useToast'
import health from 'Services/health'
import { Box, CircularProgress, IconButton, Typography } from '@material-ui/core'
import Select from 'react-select'
import useFetchData from 'hooks/fetch-data'
import '../common/components.css'

const AddGroup = ({ open, onClose, obj, assetId, isEdit = false, onAssetGroupCreated, isFromAssetGroup = false }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState({})
  const [assetGroupName, setAssetGroupName] = useState('')
  const [assetGroupDescription, setAssetGroupDescription] = useState('')
  const [criticalityIndexType, setCriticalityIndexType] = useState(enums.CRITICALITY.LOW)
  const [assetList, setAssetList] = useState([])
  const [openMenuPopup, setOpenMenuPopup] = useState(false)
  const [search, setSearch] = useState(null)
  const [pageSize, setPageSize] = useState(20)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)
  const scrollableContainerRef = useRef(null)
  const previousScrollTop = useRef(0)

  const assetFilterList = assetList.filter(item => !item.isDeleted)

  const sortClassCodes = d => {
    const list = get(d, 'data.list', [])
    setTotalCount(get(d, 'data.assetListCount', 0))
    const result = list.map(item => ({
      ...item,
      label: item?.assetName || '',
      value: item?.assetId || null,
    }))

    // const sortedList = orderBy(result, [item => item.label.toLowerCase()], ['asc'])
    return result
  }

  const assetPayload = { pagesize: pageSize, pageindex: 1, asset_group_id: isEdit && !isEmpty(obj.assetGroupId) ? obj.assetGroupId : null, search_string: isEmpty(search) ? null : search }
  const { loading: assetListLoading, data: assetListOptions, reFetch } = useFetchData({ fetch: health.assetListDropdownForAssetGroup, payload: assetPayload, formatter: d => sortClassCodes(d), condition: isEdit && !loading })

  const validateForm = async () => {
    const schema = yup.object().shape({
      assetGroupName: yup.string().required('Name is required !'),
      assetGroupDescription: yup.string().nullable().max(1024, 'Description can not be more than 1024 characters !'),
    })

    const payload = {
      assetGroupId: isEdit && !isEmpty(obj.assetGroupId) ? obj.assetGroupId : null,
      assetGroupName,
      assetGroupDescription: isEmpty(assetGroupDescription) ? null : assetGroupDescription,
      criticalityIndexType,
      assetsList: assetId ? [{ assetId: assetId, isDeleted: false }] : assetList.filter(item => (isEdit && !isEmpty(obj.assetList) ? obj.assetList.some(item1 => item.value === item1.assetId) || !item.isDeleted : !item.isDeleted)).map(item => ({ assetId: item.value, isDeleted: item.isDeleted ? item.isDeleted : false })),
      isDeleted: false,
    }

    const isValid = await validateSchema(payload, schema)
    setError(isValid)
    if (isValid === true) submitData(payload)
  }

  const submitData = async payload => {
    setIsLoading(true)
    try {
      const res = await health.addUpdateAssetGroup(snakifyKeys(payload))
      if (res.success > 0) {
        if (isEdit && obj) {
          Toast.success('Asset Group updated successfully !')
        } else {
          Toast.success('Asset Group created successfully !')
        }
        onAssetGroupCreated(res?.data?.assetGroupId)
      } else Toast.error(res.message)
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
    }

    setIsLoading(false)
    onClose()
  }

  const handleClassCodeChange = v => {
    setOpenMenuPopup(false)
    if (!assetList.some(item => item.value === v.value && !item.isDeleted)) {
      setAssetList(prev => [{ ...v, isDeleted: false }, ...prev])
    }
  }

  const handleRemoveItem = value => {
    setAssetList(prev => prev.map(item => (item.value === value ? { ...item, isDeleted: true } : item)))
  }

  useEffect(() => {
    if (isEdit && obj) {
      setAssetGroupName(obj.assetGroupName ? obj.assetGroupName : '')
      setAssetGroupDescription(obj.assetGroupDescription ? obj.assetGroupDescription : '')
      setCriticalityIndexType(obj.criticalityIndexType ? criticalityOptionsForAssetGroup.find(d => d?.value === obj.criticalityIndexType)?.value : enums.CRITICALITY.LOW)
      if (!isEmpty(obj.assetList)) {
        const assets = obj.assetList.map(asset => {
          return { ...asset, label: asset.name, value: asset.assetId, isDeleted: false }
        })
        setAssetList(assets)
      }
    }
  }, [])

  const handleClickOutside = event => {
    if (ref.current && !ref.current.contains(event.target)) {
      setOpenMenuPopup(false)
      ref.current = null
    }
  }

  useEffect(() => {
    if (openMenuPopup) {
      setPageSize(20)
      setSearch('')
    }
  }, [openMenuPopup])

  const handleInputChange = (inputValue, { action }) => {
    if (action === 'input-change') {
      setPageSize(20)
      setSearch(inputValue.trim())
      if (!open) {
        setOpenMenuPopup(true)
      }
    }
  }

  const handleLoadMore = () => {
    if (scrollableContainerRef.current) {
      previousScrollTop.current = scrollableContainerRef.current.scrollTop
    }
    setPageSize(pageSize + 20)
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true)
    return () => document.removeEventListener('click', handleClickOutside, true)
  }, [])

  useEffect(() => {
    setLoading(true)
    let timer = setTimeout(() => {
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollableContainerRef.current) {
        scrollableContainerRef.current.scrollTop = previousScrollTop.current
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [assetListOptions])

  const basic = { border: 0, display: 'flex', fontWeight: 800, padding: 0, borderRadius: '4px', background: '#eee', fontSize: '14px' }

  const styles = {
    menu: (provided, state) => ({ ...provided, padding: '0 0 0 4px ', borderRadius: '4px', border: 0, outline: 0, overflowY: 'hidden' }),
    option: (provided, state) => ({ ...provided, borderRadius: '4px', background: state.isSelected ? '#efefef' : state.isFocused ? '#f7f7f7' : 'none', color: '#000' }),
    control: () => ({ ...basic, ..._inputStyles, '&:hover': { cursor: 'pointer' } }),
    menuList: base => ({
      ...base,
      maxHeight: '200px',
      overflowY: 'auto',
      paddingRight: '4px',
      '::-webkit-scrollbar': {
        width: '4px',
        height: '1px',
      },
      '::-webkit-scrollbar-track': {
        background: '#f1f1f1',
      },
      '::-webkit-scrollbar-thumb': {
        background: '#888',
      },
      '::-webkit-scrollbar-thumb:hover': {
        background: '#555',
      },
      zIndex: 100,
    }),
    multiValueRemove: (base, state) => {
      return state.data.isFixed || base
    },
    multiValue: (base, state) => ({ ...base, padding: '1px 4px', paddingRight: state.data.isFixed || 0 }),
    placeholder: defaultStyles => {
      return {
        ...defaultStyles,
        color: '#BFBFBF',
      }
    },
  }

  const _inputStyles = { background: 'none', padding: '2px 6px', border: '1px solid #a1a1a1' }

  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title={!isEdit ? 'Create Asset Group' : 'Edit Asset Group'} style={{ width: '450px' }} closeFunc={onClose} />
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', width: '450px', background: '#efefef' }}>
        <div style={{ padding: '10px' }}>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
            <MinimalInput value={assetGroupName} onChange={setAssetGroupName} error={error.assetGroupName} label='Name' placeholder='Enter Name' onFocus={() => setError({ ...error, assetGroupName: null })} baseStyles={{ marginRight: 0 }} isRequired />
            <MinimalTextArea value={assetGroupDescription} onChange={e => setAssetGroupDescription(e.target.value)} label='Description' placeholder='Enter Description' error={error.assetGroupDescription} onFocus={() => setError({ ...error, assetGroupDescription: null })} baseStyles={{ marginRight: 0 }} />
            <MinimalButtonGroup label='Select Criticality' value={criticalityIndexType} onChange={value => setCriticalityIndexType(value)} options={criticalityOptionsForAssetGroup} w={100} />
          </div>
          {isFromAssetGroup && (
            <div style={{ marginTop: '10px', padding: '16px', background: '#fff', borderRadius: '4px' }}>
              <div className='minimal-input' style={{ width: '100%', position: 'relative' }}>
                <div className={`minimal-input-label`}>Assets</div>
                <div
                  onClick={e => {
                    e.stopPropagation()
                    setOpenMenuPopup(true)
                  }}
                >
                  <Select isLoading={assetListLoading || loading} styles={styles} placeholder='Search Assets' label='Assets' value={[]} onInputChange={handleInputChange} menuIsOpen={false} w={100} />
                </div>
                {openMenuPopup && (
                  <div ref={ref} className='rd-pop-up-container' style={{ width: '100%', marginTop: '4px', position: 'absolute', top: '100%' }}>
                    <div ref={scrollableContainerRef} className='table-responsive flex-column dashboardtblScroll d-flex' id='style-1' style={{ maxHeight: '450px', height: 'auto', padding: '10px', overflowY: 'auto' }}>
                      {!isEmpty(assetListOptions) &&
                        assetListOptions.map((item, index) => (
                          <Box
                            style={{
                              alignItems: 'center',
                              padding: '6px 4px',
                              borderBottom: index !== assetListOptions.length - 1 ? '1px solid #D1D1D1' : 'none',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#efefef')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                            key={index}
                            onClick={() => handleClassCodeChange(item)}
                          >
                            <Typography style={{ fontWeight: 400, fontSize: '14px', color: '#000000', marginRight: '5px' }}>{item.label}</Typography>
                            <Typography style={{ fontWeight: 400, fontSize: '10px', color: '#606060', marginRight: '5px' }}>{item.assetClassName ? item.assetClassName : 'N/A'}</Typography>
                            <Typography style={{ fontWeight: 400, fontSize: '12px', color: '#606060', marginRight: '5px' }}>{`${item.building} · ${item.floor} · ${item.room}`}</Typography>
                          </Box>
                        ))}
                      {isEmpty(assetListOptions) && <Typography style={{ fontSize: '12px', fontWeight: '400', color: '#606060', width: '100%', textAlign: 'center' }}>No options</Typography>}
                    </div>
                    {isEmpty(search) &&
                      !isEmpty(assetListOptions) &&
                      assetListOptions.length !== totalCount &&
                      (assetListLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <CircularProgress sx={{ color: '#778898' }} size={20} thickness={5} />
                        </Box>
                      ) : (
                        <div className='text-bold text-center' style={{ color: '#778898', cursor: 'pointer', padding: '15px 0px 8px 0px', backgroundColor: '#fff', borderTop: '2px solid #D1D1D1' }} onClick={handleLoadMore}>
                          Load More
                        </div>
                      ))}
                  </div>
                )}
              </div>
              {!isEmpty(assetFilterList) && (
                <div
                  style={{
                    marginTop: '15px',
                    border: '1px solid #D1D1D1',
                    borderRadius: '5px',
                  }}
                >
                  {assetFilterList.map((item, index) => (
                    <div
                      key={index}
                      className='d-flex justify-content-between align-items-center label-container'
                      style={{
                        borderBottom: index !== assetFilterList.length - 1 ? '1px solid #D1D1D1' : 'none',
                        width: '100%',
                        padding: '8px 10px 8px 14px',
                      }}
                    >
                      <div>
                        <Typography style={{ fontWeight: 400, fontSize: '14px', color: '#000000', marginRight: '5px' }}>{item.label}</Typography>
                        <Typography style={{ fontWeight: 400, fontSize: '10px', color: '#606060', marginRight: '5px' }}>{item.assetClassName ? item.assetClassName : 'N/A'}</Typography>
                        <Typography style={{ fontWeight: 400, fontSize: '12px', color: '#606060', marginRight: '5px' }}>{`${item.building} · ${item.floor} · ${item.room}`}</Typography>
                      </div>
                      <IconButton className='hover-lable-button' aria-label='close' size='small' onClick={() => handleRemoveItem(item.value)}>
                        <CloseIcon fontSize='small' style={{ color: '#000000' }} />
                      </IconButton>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A660', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
        <div>
          <MinimalButton variant='contained' color='primary' text={isEdit && !isEmpty(obj) ? 'Update' : 'Add'} loadingText={isEdit ? 'Updating...' : 'Adding...'} loading={isLoading} disabled={isLoading} onClick={validateForm} />
        </div>
      </div>
    </Drawer>
  )
}

export default AddGroup
