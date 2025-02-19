import React, { useState } from 'react'

import usePostData from 'hooks/post-data'

import { TableComponent } from 'components/common/table-components'
import { ActionButton, MinimalButtonGroup } from 'components/common/buttons'
import { PopupModal } from 'components/common/others'
import { MinimalAutoComplete, MinimalInput } from 'components/Assets/components'

import EditOutlinedIcon from '@material-ui/icons/EditOutlined'

import { fedByTypeOptions, racewayTypesOptions, conductorTypesOptions } from 'components/WorkOrders/onboarding/utils'
import { isEmpty, get } from 'lodash'

import asset from 'Services/assets'
import getUserRole from 'helpers/getUserRole'

const FedByCircuits = ({ initialLoading, data, reFetch, viaSubComponentOpts, optionsLoading }) => {
  const [type, setType] = useState(1)
  const [viaSubComponent, setViaSubComponent] = useState(null)
  const [length, setLength] = useState('')
  const [style, setStyle] = useState('')
  const [anchorObj, setAnchorObj] = useState({})
  const [opened, setOpened] = useState(false)
  const fedByOpts = fedByTypeOptions.map(d => ({ ...d, label: d.value === 1 ? 'Normal' : 'Emergency' }))
  const [conductorType, setConductorType] = useState([])
  const [racewayType, setRacewayType] = useState([])
  const [conductorNumber, setConductorNumber] = useState('')
  const [opcMainOptions, setOcpMainOptions] = useState([])
  const [ocpMain, setOcpMain] = useState(null)
  //
  const checkUserRole = new getUserRole()
  const columns = [
    { name: 'Asset', accessor: 'parentAssetName', isHidden: false },
    { name: 'Asset Class', accessor: 'parentAssetClassName', isHidden: false },
    { name: 'OCP', accessor: 'fedByViaSubcomponentAssetName', isHidden: false },
    { name: 'OCP Main', accessor: 'viaSubcomponentAssetName', isHidden: false },
    {
      name: 'Type',
      render: d => {
        const td = fedByOpts.find(q => q.value === d.fedByUsageTypeId)
        if (isEmpty(td)) return 'NA'
        return td.label
      },
      isHidden: false,
    },
    { name: 'Amperes', accessor: 'amps', isHidden: false },
    { name: 'Conductor Length', accessor: 'length', isHidden: false },
    {
      name: 'Conductor Material',
      render: d => {
        const material = conductorTypesOptions.find(q => q.value === d.conductorTypeId)
        if (isEmpty(material)) return 'NA'
        return material.label
      },
      isHidden: false,
    },
    { name: 'Conductor Number', render: d => d.numberOfConductor, isHidden: false },
    {
      name: 'Raceway Type',
      render: d => {
        const raceWay = racewayTypesOptions.find(q => q.value === d.racewayTypeId)
        if (isEmpty(raceWay)) return 'NA'
        return raceWay.label
      },
      isHidden: false,
    },
    { name: 'Conductor Size', accessor: 'style', isHidden: false },
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
  const handleAction = async (e, d, type) => {
    if (type === 'VIEW') return window.open(`../details/${d.parentAssetId}`, '_blank')
    e.stopPropagation()
    setAnchorObj(d)
    setType(d.fedByUsageTypeId)
    setLength(d.length || '')
    setStyle(d.style || '')
    setConductorNumber(d.numberOfConductor || 0)

    const material = conductorTypesOptions.find(q => q.value === d.conductorTypeId)
    !isEmpty(material) ? setConductorType(material) : setConductorType(null)

    const raceWay = racewayTypesOptions.find(q => q.value === d.racewayTypeId)
    !isEmpty(raceWay) ? setRacewayType(raceWay) : setRacewayType(null)

    const sub = viaSubComponentOpts.find(q => q.value === d.viaSubcomponentAssetId)
    if (!isEmpty(sub)) setViaSubComponent(sub)
    else setViaSubComponent(null)
    if (type === 'EDIT') {
      const ocpMain = await asset.subComponents.get({ assetId: d.parentAssetId, pageindex: 0, pagesize: 0 })
      if (ocpMain.success > 0) {
        const ocpOptions = get(ocpMain, 'data.list', []).map(v => ({ label: v.sublevelcomponentAssetName, value: v.sublevelcomponentAssetId }))
        setOcpMainOptions(ocpOptions)
        const ocpMainselect = ocpOptions.find(q => q.value === d.fedByViaSubcomponantAssetId)
        !isEmpty(ocpMainselect) ? setOcpMain(ocpMainselect) : setOcpMain(null)
      }
      setOpened(true)
    }
  }
  //
  const postError = () => setOpened(false)
  const postSuccess = () => {
    setOpened(false)
    reFetch()
  }
  const { loading: updateLoading, mutate: updateFedBy } = usePostData({ executer: asset.circuit.updateFedByCircuit, postError, postSuccess, message: { success: 'Fed-By circuit updated !', error: 'Something went wrong' } })
  const update = async () =>
    updateFedBy({
      assetParentHierrachyId: anchorObj.assetParentHierrachyId,
      viaSubcomponentAssetId: get(viaSubComponent, 'value', null),
      fedByUsageTypeId: type,
      length,
      style,
      fedByViaSubcomponantAssetId: get(ocpMain, 'value', null),
      numberOfConductor: parseInt(conductorNumber),
      conductorTypeId: get(conductorType, 'value', 0),
      racewayTypeId: get(racewayType, 'value', 0),
    })

  return (
    <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: '140px' }}>
      <TableComponent loading={initialLoading} columns={columns.filter(e => e.isHidden === false)} data={data} onRowClick={d => handleAction({}, d, 'VIEW')} isForViewAction={true} />
      {opened && (
        <PopupModal open={opened} onClose={() => setOpened(false)} cta='Update' title='Edit Fed-By Circuit' loadingText='Updating...' loading={updateLoading} handleSubmit={update}>
          <div className='d-flex'>
            <MinimalAutoComplete placeholder='Select OCP' loading={optionsLoading} value={ocpMain} onChange={v => setOcpMain(v)} options={opcMainOptions} label='OCP' isClearable w={50} />
            <MinimalAutoComplete placeholder='Select OCP Main' loading={optionsLoading} value={viaSubComponent} onChange={v => setViaSubComponent(v)} options={viaSubComponentOpts} label='OCP Main' isClearable w={50} />
          </div>
          <div className='d-flex'>
            <MinimalButtonGroup value={type} onChange={value => setType(value)} options={fedByOpts} label='Type' w={50} />
            <MinimalInput value={length} onChange={setLength} label='Conductor Length' placeholder='Add Conductor Length' w={50} />
          </div>
          <div className='d-flex'>
            <MinimalAutoComplete options={conductorTypesOptions} value={conductorType} onChange={val => setConductorType(val)} label='Conductor Material' placeholder='Select Material' w={50} isClearable />
            <MinimalInput w={50} value={conductorNumber} onChange={setConductorNumber} placeholder='Conductor Number' label='Conductor Number' type='number' />
          </div>
          <div className='d-flex'>
            <MinimalAutoComplete options={racewayTypesOptions} value={racewayType} onChange={val => setRacewayType(val)} label='Raceway Type' placeholder='Raceway Type' w={50} isClearable />
            <MinimalInput value={style} onChange={setStyle} label='Conductor Size' placeholder='Add Conductor Size' w={50} />
          </div>
          <div className='d-flex'></div>
        </PopupModal>
      )}
    </div>
  )
}

export default FedByCircuits
