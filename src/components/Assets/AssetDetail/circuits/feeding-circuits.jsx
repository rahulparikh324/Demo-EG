import React, { useState } from 'react'

import usePostData from 'hooks/post-data'

import { TableComponent } from 'components/common/table-components'
import { ActionButton } from 'components/common/buttons'
import { PopupModal } from 'components/common/others'
import { MinimalAutoComplete, MinimalInput } from 'components/Assets/components'

import EditOutlinedIcon from '@material-ui/icons/EditOutlined'

import { isEmpty, get } from 'lodash'

import asset from 'Services/assets'
import getUserRole from 'helpers/getUserRole'

const FeedingCircuits = ({ initialLoading, data, reFetch, viaSubComponentOpts, optionsLoading }) => {
  const [circuit, setCircuit] = useState('')
  const [viaSubComponentOptList, setViaSubComponentOptList] = useState(viaSubComponentOpts)
  const [viaSubComponent, setViaSubComponent] = useState(null)
  const [anchorObj, setAnchorObj] = useState({})
  const [opened, setOpened] = useState(false)
  //
  const checkUserRole = new getUserRole()
  const columns = [
    { name: 'Asset Name', accessor: 'childrenAssetName', isHidden: false },
    { name: 'Asset Class', accessor: 'childrenAssetClssName', isHidden: false },
    { name: 'OCP', accessor: 'viaSubcomponentAssetName', isHidden: false },
    { name: 'Amperes', accessor: 'amps', isHidden: false },
    { name: 'Circuit(s)', accessor: 'circuit', isHidden: false },
    {
      name: 'Action',
      render: d => (
        <div className='d-flex align-items-center'>
          <ActionButton tooltip='EDIT CIRCUIT' action={e => handleAction(e, d, 'EDIT')} icon={<EditOutlinedIcon fontSize='small' />} />
        </div>
      ),
      isHidden: false,
    },
  ]
  const handleAction = (e, d, type) => {
    if (type === 'VIEW') return window.open(`../details/${d.childrenAssetId}`, '_blank')
    e.stopPropagation()
    setAnchorObj(d)
    const sub = viaSubComponentOpts.find(q => q.value === d.viaSubcomponentAssetId)
    const dataExceptCurrent = data.filter(x => x.viaSubcomponentAssetId !== d.viaSubcomponentAssetId)
    const viaSubComponentList = viaSubComponentOpts.filter(opt => {
      return !dataExceptCurrent.some(item => item.viaSubcomponentAssetId === opt.value)
    })
    setViaSubComponentOptList(viaSubComponentList)
    if (!isEmpty(sub)) setViaSubComponent(sub)
    else setViaSubComponent(null)
    setCircuit(get(d, 'circuit', '') || '')
    if (type === 'EDIT') return setOpened(true)
  }
  //
  const postError = () => setOpened(false)
  const postSuccess = () => {
    setOpened(false)
    reFetch()
  }
  const { loading: updateLoading, mutate: updateFedBy } = usePostData({ executer: asset.circuit.updateFeedingCircuit, postError, postSuccess, message: { success: 'Feeding circuit updated !', error: 'Something went wrong' } })
  const update = async () => updateFedBy({ assetChildrenHierrachyId: anchorObj.assetChildrenHierrachyId, viaSubcomponentAssetId: get(viaSubComponent, 'value', null), circuit })

  return (
    <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(70% - 40px)' }}>
      <TableComponent loading={initialLoading} columns={columns.filter(e => e.isHidden === false)} data={data} onRowClick={d => handleAction({}, d, 'VIEW')} isForViewAction={true} />
      {opened && (
        <PopupModal open={opened} onClose={() => setOpened(false)} cta='Update' title='Edit Feeding Circuit' loadingText='Updating...' loading={updateLoading} handleSubmit={update}>
          <MinimalAutoComplete placeholder='Select OCP' loading={optionsLoading} value={viaSubComponent} onChange={v => setViaSubComponent(v)} options={viaSubComponentOptList} label='OCP' isClearable w={100} />
          {/* <MinimalInput value={circuit} onChange={setCircuit} label='Circuit' placeholder='Add circuit' baseStyles={{ marginRight: 0 }} /> */}
        </PopupModal>
      )}
    </div>
  )
}

export default FeedingCircuits
