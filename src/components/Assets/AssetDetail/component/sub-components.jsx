import React, { useEffect, useState, useRef } from 'react'

import useFetchData from 'hooks/fetch-data'
import usePostData from 'hooks/post-data'
import { get, isEmpty, orderBy } from 'lodash'
import { components } from 'react-select'

import { TableComponent } from 'components/common/table-components'
import { MinimalButton, ActionButton, MinimalButtonGroup } from 'components/common/buttons'
import { PopupModal } from 'components/common/others'
import DialogPrompt from 'components/DialogPrompt'
import { MinimalInput, MinimalAutoComplete } from 'components/Assets/components'

import AddIcon from '@material-ui/icons/Add'
import EditOutlinedIcon from '@material-ui/icons/EditOutlined'
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined'

import asset from 'Services/assets'
import assetClass from 'Services/WorkOrder/asset-class'
import getUserRole from 'helpers/getUserRole'

const SubComponents = ({ assetId, subRefetch }) => {
  //
  const [circuit, setCircuit] = useState('')
  const [anchorObj, setAnchorObj] = useState({})
  const [opened, setOpened] = useState({ isEdit: false, isDelete: false, isAdd: false })
  const isFirstRender = useRef(true)

  //type
  const typeOptions = [
    { label: 'Use Existing', value: 1 },
    { label: 'Create New', value: 2 },
  ]
  const [type, setType] = useState(typeOptions[0].value)
  const isSubcomponentForExisting = type === typeOptions[0].value
  // existing sub components
  const formatSubCompOptions = list => list.map(d => ({ ...d, label: d.assetName, value: d.assetId }))
  const [selectedSubComponent, setSelectedSubComponent] = useState(null)
  const { loading: subCompOptionsLoading, data: subCompOptions, reFetch: optionsRefetch } = useFetchData({ fetch: asset.subComponents.getSubComponentsToAdd, formatter: d => formatSubCompOptions(get(d, 'data.list', [])) })
  // create new component
  const sortClassCodes = d => {
    const list = get(d, 'data', [])
    list.forEach(d => {
      d.id = d.value
      d.value = d.className
    })
    const sortedList = orderBy(list, [d => d.label && d.label.toLowerCase()], 'asc')
    return sortedList
  }
  const { loading: classCodeOptionsLoading, data: classCodeOptions } = useFetchData({ fetch: assetClass.getAllAssetClassCodes, formatter: d => sortClassCodes(d) })
  const [assetName, setAssetName] = useState('')
  const [assetClassCode, setClassCode] = useState(null)
  // main list
  const { loading: subComponentsLoading, data, reFetch } = useFetchData({ fetch: asset.subComponents.get, payload: { pageindex: 1, pagesize: 20, assetId }, formatter: d => get(d, 'data.list', []) })
  //

  useEffect(() => {
    if (isFirstRender.current) {
      // Skip the effect on the initial render
      isFirstRender.current = false
      return
    }
    reFetch()
  }, [subRefetch])

  const checkUserRole = new getUserRole()
  const columns = [
    { name: 'Asset Name', accessor: 'sublevelcomponentAssetName', isHidden: false },
    { name: 'Asset Class', accessor: 'sublevelcomponentAssetClassName', isHidden: false },
    { name: 'Rated Amps', accessor: 'ratedAmps', isHidden: false },
    { name: 'Circuit(s)', accessor: 'circuit', isHidden: false },
    {
      name: 'Actions',
      render: d => (
        <div className='d-flex align-items-center'>
          <ActionButton tooltip='EDIT CIRCUIT' action={e => handleAction(e, d, 'EDIT')} icon={<EditOutlinedIcon fontSize='small' />} />
          <ActionButton tooltip='DELETE' action={e => handleAction(e, d, 'DELETE')} icon={<DeleteOutlineOutlinedIcon fontSize='small' style={{ color: '#FF0000' }} />} />
        </div>
      ),
      isHidden: false,
    },
  ]
  const handleAction = (e, d, type) => {
    if (type === 'VIEW') return window.open(`../details/${d.sublevelcomponentAssetId}`, '_blank')
    e.stopPropagation()
    setAnchorObj(d)
    setCircuit(get(d, 'circuit', '') || '')
    if (type === 'EDIT') return setOpened({ isEdit: true, isDelete: false, isAdd: false })
    else return setOpened({ isEdit: false, isDelete: true, isAdd: false })
  }
  const CustomOptions = ({ children, ...props }) => {
    return (
      <components.Option {...props}>
        <div className='d-flex align-items-center justify-content-between'>
          <div className='text-bold'>{props.data.className} </div>
          <div className='text-bold text-accent'>{props.data.label}</div>
        </div>
      </components.Option>
    )
  }
  //
  const postError = () => {
    setOpened({ isEdit: false, isDelete: false, isAdd: false })
    setClassCode(null)
    setSelectedSubComponent(null)
    setAssetName('')
    setType(typeOptions[0].value)
  }
  const postSuccess = () => {
    setOpened({ isEdit: false, isDelete: false, isAdd: false })
    setClassCode(null)
    setSelectedSubComponent(null)
    setAssetName('')
    setType(typeOptions[0].value)
    reFetch()
    optionsRefetch()
  }
  const { loading: updateLoading, mutate: updateComponent } = usePostData({ executer: asset.subComponents.update, postError, postSuccess, message: { success: "Sub Component (OCP's) Updated !", error: 'Something went wrong' } })
  const { loading: deleteLoading, mutate: deleteComponent } = usePostData({ executer: asset.subComponents.delete, postError, postSuccess, message: { success: "Sub Component (OCP's) Deleted !", error: 'Something went wrong' } })
  const { loading: addLoading, mutate: addComponent } = usePostData({ executer: asset.subComponents.addNew, postError, postSuccess, message: { success: "Sub Component (OCP's) Added !", error: 'Something went wrong' } })
  const updateSubComponent = async () => updateComponent({ assetSublevelcomponentMappingId: anchorObj.assetSublevelcomponentMappingId, circuit })
  const handleDelete = async () => deleteComponent({ assetSublevelcomponentMappingId: anchorObj.assetSublevelcomponentMappingId })
  const addSubComponent = async () => addComponent({ assetId, isSubcomponentForExisting, sublevelcomponentAssetId: get(selectedSubComponent, 'assetId', null), sublevelcomponentAssetName: assetName, inspectiontemplateAssetClassId: get(assetClassCode, 'id', null) })
  //
  const isAddDisabled = () => {
    if (type === typeOptions[0].value && !isEmpty(selectedSubComponent)) return false
    if (type === typeOptions[1].value && !isEmpty(assetClassCode) && !isEmpty(assetName)) return false
    return true
  }

  return (
    <div style={{ height: 'calc(100% - 42px)', padding: '10px', minHeight: '400px' }}>
      <MinimalButton onClick={() => setOpened({ isEdit: false, isDelete: false, isAdd: true })} text="Add Sub Component (OCP's)" startIcon={<AddIcon fontSize='small' />} variant='contained' color='primary' baseClassName='xs-button mb-2' />
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100% - 35px)' }}>
        <TableComponent loading={subComponentsLoading} columns={columns.filter(e => e.isHidden === false)} data={data} onRowClick={d => handleAction({}, d, 'VIEW')} isForViewAction={true} />
      </div>
      {/* EDIT */}
      {opened.isEdit && (
        <PopupModal open={opened.isEdit} onClose={postError} cta='Update' title='Edit Circuit' loadingText='Updating...' loading={updateLoading} handleSubmit={updateSubComponent}>
          <MinimalInput value={circuit} onChange={setCircuit} label='Circuit(s)' placeholder='Add circuit' baseStyles={{ marginRight: 0 }} />
        </PopupModal>
      )}
      {/* DELETE */}
      <DialogPrompt title="Delete Sub Component (OCP's)" text="Are you sure you want to remove the Sub Component (OCP's) from the Asset ?" actionLoader={deleteLoading} open={opened.isDelete} ctaText='Delete' action={handleDelete} handleClose={postError} />
      {opened.isAdd && (
        <PopupModal open={opened.isAdd} onClose={postError} cta='Add' title="Add Sub Component (OCP's)" loadingText='Adding...' loading={addLoading} handleSubmit={addSubComponent} disableCTA={isAddDisabled()}>
          <MinimalButtonGroup label='Select Type' value={type} onChange={value => setType(value)} options={typeOptions} w={100} baseStyles={{ marginRight: 0 }} />
          {isSubcomponentForExisting ? (
            <MinimalAutoComplete value={selectedSubComponent} onChange={value => setSelectedSubComponent(value)} loading={subCompOptionsLoading} placeholder="Select Sub Component (OCP's)" options={subCompOptions} label="Sub Component (OCP's)" isClearable w={100} />
          ) : (
            <>
              <MinimalInput value={assetName} onChange={setAssetName} label='Asset Name' placeholder='Add Asset Name' w={100} />
              <MinimalAutoComplete loading={classCodeOptionsLoading} placeholder='Select Class' value={assetClassCode} onChange={v => setClassCode(v)} options={classCodeOptions} label='Asset Class' isClearable w={100} components={{ Option: CustomOptions }} />
            </>
          )}
        </PopupModal>
      )}
    </div>
  )
}

export default SubComponents
