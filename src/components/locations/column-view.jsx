import React, { useState, useEffect } from 'react'

import useFetchData from 'hooks/fetch-data'
import usePostData from 'hooks/post-data'

import { get, isEmpty, orderBy } from 'lodash'

import locations from 'Services/locations'

import { ItemContainer, Section, EmptySection } from 'components/preventative-maintenance/common/components'
import { MinimalButton } from 'components/common/buttons'
import { AssetItem } from 'components/locations/components'
import AddColumn from 'components/locations/add-column'
import DialogPrompt from 'components/DialogPrompt'
import EditSection from 'components/locations/edit-section'

import LayersOutlinedIcon from '@material-ui/icons/LayersOutlined'
import MeetingRoomOutlinedIcon from '@material-ui/icons/MeetingRoomOutlined'
import BusinessOutlinedIcon from '@material-ui/icons/BusinessOutlined'
import ArrowForwardOutlinedIcon from '@material-ui/icons/ArrowForwardOutlined'
import CircularProgress from '@material-ui/core/CircularProgress'
import Checkbox from '@material-ui/core/Checkbox'
import MoveColumn from './move-column'

const ColumnView = () => {
  const [activeBuildingId, setActiveBuildingId] = useState(null)
  const [activeFloorId, setActiveFloorId] = useState(null)
  const [activeRoomId, setActiveRoomId] = useState(null)

  const [accessFloor, setAccessFloor] = useState(false)
  const [accessRoom, setAccessRoom] = useState(false)
  const [accessAsset, setAccessAsset] = useState(false)

  const [buildingObj, setBuildingObj] = useState({})
  const [floorObj, setfloorObj] = useState({})
  const [roomObj, setroomObj] = useState({})

  const [floorsData, setFloorsData] = useState([])
  const [roomsData, setRoomsData] = useState([])
  const [assetData, setAssetData] = useState([])

  const [mode, setMode] = useState({ isBuilding: false, isFloor: false, isRoom: false })
  const [isAddOpen, setAddOpen] = useState(false)
  const [formTitle, setFormTitle] = useState('')

  const [ancherObj, setAncherObj] = useState({})
  const [openDelete, setOpenDelete] = useState({ isDelete: false, name: '' })
  const [deleteItem, setDeleteItem] = useState({
    formiobuildingId: 0,
    formiofloorId: 0,
    formioroomId: 0,
  })

  const [sectionFields, setSectionFields] = useState([])
  const [openSection, setOpenSection] = useState(false)
  const [isMoveOpen, setMoveOpen] = useState(false)
  const [isEditMode, setEditMode] = useState(false)
  const [selected, setSelected] = useState([])
  const [editCheckbox, setEditCheckbox] = useState({ assets: true, subAssets: true })
  const [showTopLevel, setShowTopLevel] = useState(true)

  const [isEditOpen, setEditOpen] = useState(false)
  const [editFields, setEditFields] = useState({})

  // get building
  const { initialLoading: buildingLoading, data: buildingData, reFetch: buildingRefetch } = useFetchData({ fetch: locations.columns.getBuilding, formatter: d => get(d, 'data', {}), defaultValue: {} })
  // get floor
  const handleBuildingClick = building => {
    setAccessFloor(true)
    setBuildingObj(building)
    setActiveBuildingId(get(building, 'formiobuildingId', null))
    setFloorsData([])
    setRoomsData([])
    setAssetData([])
    setActiveFloorId(null)
    setActiveRoomId(null)
  }
  const handleFormateFloors = floors => {
    setAccessFloor(false)
    const sortingFloorList = orderBy(get(floors, 'floorList', []), [d => d.formioFloorName && d.formioFloorName.toLowerCase()], ['asc'])
    setFloorsData(sortingFloorList)
    return floors
  }
  const { initialLoading: floorLoading, reFetch: floorRefetch } = useFetchData({ fetch: locations.columns.getFloor, payload: get(buildingObj, 'formiobuildingId', null), formatter: d => handleFormateFloors(get(d, 'data', {})), defaultValue: {}, condition: accessFloor })

  // get rooms

  const handleFloorClick = floor => {
    setAccessRoom(true)
    setfloorObj(floor)
    setActiveFloorId(get(floor, 'formiofloorId', null))
    setRoomsData([])
    setAssetData([])
  }

  const handleFormateRooms = room => {
    setAccessRoom(false)
    const sortingRoomList = orderBy(get(room, 'roomList', []), [d => d.formioRoomName && d.formioRoomName.toLowerCase()], ['asc'])
    setRoomsData(sortingRoomList)
  }

  const { initialLoading: roomLoading, reFetch: roomRefetch } = useFetchData({ fetch: locations.columns.getRoom, payload: get(floorObj, 'formiofloorId', null), formatter: d => handleFormateRooms(get(d, 'data', {})), defaultValue: {}, condition: accessRoom })

  // get Asset
  const handleRoomClick = room => {
    setAccessAsset(true)
    setroomObj(room)
    setActiveRoomId(get(room, 'formioroomId', null))
    setAssetData([])
  }
  const handleFormateAssets = res => {
    setAccessAsset(false)
    const assets = orderBy(
      get(res, 'list', []).map(d => ({ ...d, name: d.assetName, buildingId: get(buildingObj, 'formiobuildingId', null), floorId: get(roomObj, 'formiofloorId', null), roomId: get(roomObj, 'formioroomId', null) })),
      [d => d.name && d.name.toLowerCase()],
      ['asc']
    )
    assets?.forEach(asset => {
      asset.subLevelComponents = orderBy(asset.subLevelComponents, [d => d.sublevelcomponentAssetName && d.sublevelcomponentAssetName.toLowerCase()], ['asc'])
    })
    setAssetData(assets)
  }

  const { initialLoading: assetLoading, reFetch: assetRefetch } = useFetchData({
    fetch: locations.getAssetsbyLocationHierarchy,
    payload: { woId: null, pagesize: 0, pageindex: 0, searchString: '', formiobuildingId: get(buildingObj, 'formiobuildingId', null), formiofloorId: get(roomObj, 'formiofloorId', null), formioroomId: get(roomObj, 'formioroomId', null) },
    formatter: d => handleFormateAssets(get(d, 'data', {})),
    defaultValue: {},
    condition: accessAsset,
  })

  const handleExpandAsset = asset => {
    const oldAsset = structuredClone(assetData)
    const assets = oldAsset.find(val => val.assetId === asset.assetId)
    assets.subLevelComponents.forEach(d => {
      d.name = d.sublevelcomponentAssetName
      d.isExpanded = false
    })
    assets.isExpanded = !assets.isExpanded
    setAssetData(oldAsset)
  }

  const handleNewBuilding = () => {
    setAddOpen(true)
    setMode({ ...mode, isBuilding: true })
    setFormTitle('Add Building')
    setAncherObj({})
  }

  const handleNewFloor = () => {
    setAddOpen(true)
    setMode({ ...mode, isFloor: true })
    setFormTitle('Add Floor')
    setAncherObj(buildingObj)
  }

  const handleNewRoom = () => {
    setAddOpen(true)
    setMode({ ...mode, isRoom: true })
    setFormTitle('Add Room')
    setAncherObj({ ...buildingObj, ...floorObj })
  }
  // delete
  const postSuccess = () => {
    setOpenDelete({ isDelete: false })
    if (deleteItem.formiobuildingId !== 0) {
      buildingRefetch()
      if (deleteItem.formiobuildingId === activeBuildingId) {
        setFloorsData([])
        setRoomsData([])
        setActiveBuildingId(null)
        setActiveFloorId(null)
      }
    } else if (deleteItem.formiofloorId !== 0) {
      floorRefetch()
      setAccessFloor(true)
      buildingRefetch()
      if (deleteItem.formiofloorId === activeFloorId) {
        setRoomsData([])
        setActiveFloorId(null)
      }
    } else {
      roomRefetch()
      setAccessRoom(true)
      floorRefetch()
      setAccessFloor(true)
    }
  }

  const { loading: deleteLoading, mutate: deleteLocation } = usePostData({ executer: locations.deleteLocationDetails, postSuccess, message: { success: 'Location Deleted Successfully !', error: 'Something Went Wrong !' } })
  const handleDeleteLocation = () => deleteLocation({ formiobuildingId: deleteItem.formiobuildingId, formiofloorId: deleteItem.formiofloorId, formioroomId: deleteItem.formioroomId })

  // actions options

  const buildingOptions = [
    { id: 2, name: 'Edit', action: d => (setEditOpen(true), setEditFields(d)) },
    { id: 1, name: 'Delete', action: d => (setOpenDelete({ isDelete: true, name: 'Building' }), setDeleteItem({ formiobuildingId: d.formiobuildingId, formiofloorId: 0, formioroomId: 0 })), color: '#FF0000' },
  ]
  const floorOptions = [
    { id: 2, name: 'Edit', action: d => (setEditOpen(true), setEditFields(d)) },
    { id: 1, name: 'Delete', action: d => (setOpenDelete({ isDelete: true, name: 'Floor' }), setDeleteItem({ formiobuildingId: 0, formiofloorId: d.formiofloorId, formioroomId: 0 })), color: '#FF0000' },
  ]
  const roomOptions = [
    { id: 2, name: 'Edit', action: d => (setEditOpen(true), setEditFields({ ...d, formiobuildingId: activeBuildingId })) },
    { id: 1, name: 'Delete', action: d => (setOpenDelete({ isDelete: true, name: 'Room' }), setDeleteItem({ formiobuildingId: 0, formiofloorId: 0, formioroomId: d.formioroomId })), color: '#FF0000' },
  ]

  // edit section

  const handleSection = (e, value) => {
    setOpenSection(true)
    setSectionFields(value)
  }

  // move

  const handleCheckBoxChange = (e, data) => {
    if (isEmpty(selected)) {
      isEmpty(data.sublevelcomponentAssetId) ? setEditCheckbox({ assets: true, subAssets: false }) : setEditCheckbox({ assets: false, subAssets: true })
    }
    if (isEmpty(data.sublevelcomponentAssetId)) {
      if (selected.includes(data.assetId)) setSelected(p => p.filter(d => d !== data.assetId))
      else setSelected(p => [...p, data.assetId])
      setShowTopLevel(false)
    } else {
      if (selected.includes(data.sublevelcomponentAssetId)) setSelected(p => p.filter(d => d !== data.sublevelcomponentAssetId))
      else setSelected(p => [...p, data.sublevelcomponentAssetId])
      setShowTopLevel(true)
    }
  }

  const handleMoveDirect = (e, data) => {
    handleCheckBoxChange(e, data)
    setMoveOpen(true)
  }

  const handleCancel = () => {
    setEditMode(false)
    setSelected([])
  }

  useEffect(() => {
    if (isEmpty(selected)) setEditCheckbox({ assets: true, subAssets: true })
  }, [selected])

  const handleCheckedAll = (e, data) => {
    if (isEmpty(selected)) {
      isEmpty(data.sublevelcomponentAssetId) ? setEditCheckbox({ assets: true, subAssets: false }) : setEditCheckbox({ assets: false, subAssets: true })
    }
    setShowTopLevel(false)
    const assetIds = data.map(p => p.assetId)
    if (e.target.checked) setSelected(p => [...p, ...assetIds])
    else setSelected(p => p.filter(d => !assetIds.includes(d)))
  }

  return (
    <div style={{ background: '#fff', height: 'calc(100vh - 128px)' }} className='table-responsive dashboardtblScroll' id='style-1'>
      <div className='d-flex' style={{ height: '100%' }}>
        <Section loading={buildingLoading} title='Buildings' onAction={handleNewBuilding} isLocation>
          {isEmpty(buildingData?.buildingList) ? (
            <EmptySection message='No Building Found !' />
          ) : (
            get(buildingData, 'buildingList', []).map(building => (
              <ItemContainer
                id={building.formiobuildingId}
                onClick={() => handleBuildingClick(building)}
                data={building}
                count={building.floorCount}
                hasMenu
                menuOptions={buildingOptions}
                key={building.formiobuildingId}
                isActive={building.formiobuildingId === activeBuildingId}
                title={
                  <div className='d-flex'>
                    <BusinessOutlinedIcon fontSize='small' style={{ marginRight: '6px', color: '#474747' }} /> {building.formioBuildingName}
                  </div>
                }
                isLocation
              />
            ))
          )}
        </Section>
        <Section loading={floorLoading} title='Floors' onAction={handleNewFloor} isLocation isActionDisabled={activeBuildingId === null}>
          {isEmpty(floorsData) ? (
            <EmptySection message={activeBuildingId === null ? 'No Building Selected' : 'No Floor Found !'} />
          ) : (
            floorsData?.map(floor => (
              <ItemContainer
                id={floor.formiofloorId}
                onClick={() => handleFloorClick(floor)}
                data={floor}
                count={floor.roomCount}
                hasMenu
                menuOptions={floorOptions}
                key={floor.formiofloorId}
                isActive={floor.formiofloorId === activeFloorId}
                title={
                  <div className='d-flex'>
                    <LayersOutlinedIcon fontSize='small' style={{ marginRight: '6px', color: '#474747' }} />
                    {floor.formioFloorName}
                  </div>
                }
                isLocation
              />
            ))
          )}
        </Section>
        <Section loading={roomLoading} title='Rooms' onAction={handleNewRoom} isLocation isActionDisabled={activeFloorId === null}>
          {isEmpty(roomsData) ? (
            <EmptySection message={activeFloorId === null ? 'No Floor Selected' : 'No Room Found !'} />
          ) : (
            roomsData.map(room => (
              <ItemContainer
                id={room.formioroomId}
                onClick={() => handleRoomClick(room)}
                data={room}
                count={room.assetCount}
                hasMenu
                menuOptions={roomOptions}
                key={room.formioroomId}
                isActive={room.formioroomId === activeRoomId}
                title={
                  <div className='d-flex'>
                    <MeetingRoomOutlinedIcon fontSize='small' style={{ marginRight: '6px', color: '#474747' }} />
                    {room.formioRoomName}
                  </div>
                }
                isLocation
              />
            ))
          )}
        </Section>
        {/* Asset */}
        <div style={{ borderRight: '1px solid #EAEAEA', minWidth: '450px', height: 'auto' }} className='table-responsive dashboardtblScroll' id='style-1'>
          <div style={{ height: '40px', borderBottom: '1px solid #EAEAEA' }} className='d-flex justify-content-between align-items-center px-2 py-1'>
            {!isEditMode && <MinimalButton disabled={isEmpty(assetData)} text='Move Assets' size='small' startIcon=<ArrowForwardOutlinedIcon /> onClick={() => setEditMode(true)} variant='contained' color='primary' baseClassName='nf-buttons' style={{ fontSize: '12px', padding: '3px 9px 3px 6px' }} />}
            {isEditMode && (
              <div className='d-flex'>
                <MinimalButton onClick={handleCancel} text='Cancel' size='small' variant='contained' color='default' baseClassName='nf-buttons mr-2' />
                <MinimalButton onClick={() => setMoveOpen(true)} text='Move' size='small' startIcon={<ArrowForwardOutlinedIcon fontSize='small' />} disabled={isEmpty(selected)} variant='contained' color='primary' baseClassName='nf-buttons' />
              </div>
            )}
          </div>
          <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100vh - 168px)' }}>
            {/* header */}
            {!isEmpty(assetData) ? (
              <>
                <div className='align-items-center' style={{ display: 'grid', gridTemplateColumns: 'auto 145px 75px', paddingLeft: '26px', height: '35px' }}>
                  <div className='d-flex align-items-center'>
                    {isEditMode && editCheckbox.assets && <Checkbox color='primary' size='small' checked={assetData.every(d => selected.includes(d.assetId))} style={{ padding: 0 }} onClick={e => e.stopPropagation()} onChange={e => handleCheckedAll(e, assetData)} />}
                    <div className='text-bold ml-2'>Assets</div>
                  </div>
                  <div className='text-bold'>Section</div>
                  <div className='text-bold'>Actions</div>
                </div>
                {assetData.map(asset => (
                  <AssetItem key={asset.assetId} data={asset} isEditMode={isEditMode} expand={handleExpandAsset} editCheckbox={handleCheckBoxChange} directMove={handleMoveDirect} checked={selected} checkHide={editCheckbox.assets} editSection={e => handleSection(e, asset)} isColumnView>
                    {get(asset, 'subLevelComponents', []).map(subAsset => (
                      <AssetItem key={subAsset.sublevelcomponentAssetId} data={subAsset} isEditMode={isEditMode} offset='12px' editCheckbox={handleCheckBoxChange} directMove={handleMoveDirect} checked={selected} checkHide={editCheckbox.subAssets} width='calc(100% - 40px)' editSection={e => handleSection(e, subAsset)} isColumnView />
                    ))}
                  </AssetItem>
                ))}
              </>
            ) : assetLoading ? (
              <div style={{ minWidth: '250px', height: 'calc(100vh - 168px)' }} className='d-flex justify-content-center align-items-center'>
                <CircularProgress size={19} thickness={5} style={{ marginRight: '6px', marginLeft: '6px' }} />
              </div>
            ) : (
              <div style={{ height: 'calc(100vh - 168px)', opacity: 0.5, textAlign: 'center' }} className='text-bold d-flex justify-content-center align-items-center'>
                {activeRoomId === null ? 'No Room Selected' : 'No Asset Found !'}
              </div>
            )}
          </div>
        </div>
      </div>
      {isAddOpen && (
        <AddColumn
          open={isAddOpen}
          onClose={() => (setAddOpen(false), setMode({ isBuilding: false, isFloor: false, isRoom: false }))}
          title={formTitle}
          mode={mode}
          ancherObj={ancherObj}
          buildingRefetch={buildingRefetch}
          roomRefetch={() => (roomRefetch(), setAccessRoom(true), floorRefetch(), setAccessFloor(true))}
          floorRefetch={() => (floorRefetch(), setAccessFloor(true), buildingRefetch())}
        />
      )}
      <DialogPrompt title={`Delete ${openDelete.name}`} text={`Are you sure you want to delete this ${openDelete.name}?`} actionLoader={deleteLoading} open={openDelete.isDelete} action={handleDeleteLocation} ctaText='Delete' handleClose={() => setOpenDelete({ isDelete: false })} />
      {openSection && <EditSection open={openSection} onClose={() => setOpenSection(false)} reFetch={() => (assetRefetch(), setAccessAsset(true))} editSection={sectionFields} />}
      {isMoveOpen && <MoveColumn open={isMoveOpen} onClose={() => setMoveOpen(false)} reFetch={() => (assetRefetch(), setAccessAsset(true), roomRefetch(), setAccessRoom(true))} isChange={isMoveOpen} selectedAsset={selected} resetSelection={() => setSelected([])} showTopLevel={showTopLevel} setEditMode={setEditMode} />}
      {isEditOpen && (
        <MoveColumn
          open={isEditOpen}
          onClose={() => setEditOpen(false)}
          reFetch={() => (roomRefetch(), setAccessRoom(true))}
          editFields={editFields}
          isEdit={true}
          buildingRefetch={buildingRefetch}
          floorRefetch={() => (floorRefetch(), setAccessFloor(true), buildingRefetch(), setRoomsData([]), setAssetData([]))}
          roomRefetch={() => (roomRefetch(), setAccessRoom(true), floorRefetch(), setAccessFloor(true), setAssetData([]))}
        />
      )}
    </div>
  )
}

export default ColumnView
