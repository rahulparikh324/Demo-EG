import React, { useEffect, useState } from 'react'

import useFetchData from 'hooks/fetch-data'
import usePostData from 'hooks/post-data'

import AddIcon from '@material-ui/icons/Add'
import EditOutlinedIcon from '@material-ui/icons/EditOutlined'
import ArrowForwardOutlinedIcon from '@material-ui/icons/ArrowForwardOutlined'
import BusinessOutlinedIcon from '@material-ui/icons/BusinessOutlined'

import { MinimalButton } from 'components/common/buttons'
import { AssetListHeader, AssetItem, Loader, FloorListHeader, RoomListHeader, BuildingFloorRoomCount } from 'components/locations/components'
import AddEditLocation from 'components/locations/add'
import DialogPrompt from 'components/DialogPrompt'

import locations from 'Services/locations'

import getUserRole from 'helpers/getUserRole'
import { get, isEmpty, orderBy } from 'lodash'
import { Toast } from 'Snackbar/useToast'

import EditSection from 'components/locations/edit-section'

const Locations = () => {
  //
  const userRole = new getUserRole()
  const [isEditMode, setEditMode] = useState(false)
  const [isMoveOpen, setMoveOpen] = useState(false)
  const [open, setOpen] = useState({ isAdd: false, isEdit: false, isSection: false })
  const [buildings, setBuilding] = useState([])
  const [editFields, setEditFields] = useState([])
  const [openDelete, setOpenDelete] = useState({ isDelete: false, name: '' })
  const [deleteItem, setDeleteItem] = useState({
    formiobuildingId: 0,
    formiofloorId: 0,
    formioroomId: 0,
  })
  const [editCheckbox, setEditCheckbox] = useState({ asset: true, subAsset: true })
  const [selected, setSelected] = useState([])
  const [showTopLevel, setShowTopLevel] = useState(true)
  const [sectionFields, setSectionFields] = useState([])

  // expand/collapse
  const handleExpandBuilding = building => {
    const oldBuildings = [...buildings]
    const current = oldBuildings.find(d => d.formiobuildingId === building.formiobuildingId)
    const floors = orderBy(current.floors, [floor => floor.formioFloorName && floor.formioFloorName.toLowerCase()], ['asc'])
    floors.forEach(d => {
      d.name = d.formioFloorName
      d.isExpanded = false
    })
    current.isExpanded = !current.isExpanded
    setBuilding(oldBuildings)
  }
  const handleExpandFloor = floor => {
    const oldBuildings = [...buildings]
    const currentB = oldBuildings.find(d => d.formiobuildingId === floor.formiobuildingId)
    const current = get(currentB, 'floors', []).find(d => d.formiofloorId === floor.formiofloorId)
    const rooms = current.rooms
    rooms.forEach(d => {
      d.formiobuildingId = floor.formiobuildingId
      d.name = d.formioRoomName
      d.isExpanded = false
    })
    current.isExpanded = !current.isExpanded
    setBuilding(oldBuildings)
  }
  const handleExpandRoom = async room => {
    try {
      if (!isEmpty(room.assets)) return updateRoom(room, false, !room.isExpanded, room.assets)
      updateRoom(room, true)
      const res = await locations.getAssetsbyLocationHierarchy({ woId: null, pagesize: 0, pageindex: 0, searchString: '', formiobuildingId: room.formiobuildingId, formiofloorId: room.formiofloorId, formioroomId: room.formioroomId })
      if (res.success) {
        const assets = orderBy(
          get(res, 'data.list', []).map(d => ({ ...d, name: d.assetName, buildingId: room.formiobuildingId, floorId: room.formiofloorId, roomId: room.formioroomId })),
          [d => d.name && d.name.toLowerCase()],
          ['asc']
        )
        assets?.forEach(asset => {
          asset.subLevelComponents = orderBy(asset.subLevelComponents, [d => d.sublevelcomponentAssetName && d.sublevelcomponentAssetName.toLowerCase()], ['asc'])
        })
        updateRoom(room, false, true, assets)
      } else throw new Error()
    } catch (error) {
      updateRoom(room, false, false, [])
      Toast.error(`Error fetching assets. Please try again !`)
    }
  }
  const updateRoom = (room, loading, isExpanded, assets) => {
    const oldBuildings = structuredClone(buildings)
    const currentB = oldBuildings.find(d => d.formiobuildingId === room.formiobuildingId)
    const currentF = get(currentB, 'floors', []).find(d => d.formiofloorId === room.formiofloorId)
    const current = get(currentF, 'rooms', []).find(d => d.formioroomId === room.formioroomId)
    current.loading = loading
    current.isExpanded = current.isExpanded ? false : isExpanded
    current.assets = assets
    setBuilding(oldBuildings)
  }
  const handleExpandAsset = asset => {
    const oldBuildings = structuredClone(buildings)
    const currentB = oldBuildings.find(d => d.formiobuildingId === asset.buildingId)
    const currentF = get(currentB, 'floors', []).find(d => d.formiofloorId === asset.floorId)
    const currentR = get(currentF, 'rooms', []).find(d => d.formioroomId === asset.roomId)
    const current = get(currentR, 'assets', []).find(d => d.assetId === asset.assetId)
    const subAsset = current.subLevelComponents
    subAsset.forEach(d => {
      d.name = d.sublevelcomponentAssetName
      d.isExpanded = false
    })
    current.isExpanded = !current.isExpanded
    setBuilding(oldBuildings)
  }

  const formatBuildings = list => {
    const oldBuildings = structuredClone(buildings)
    const newbuildings = orderBy(
      [...list].map(d => ({ ...d, isExpanded: false, name: d.formioBuildingName })),
      [d => d.name && d.name.toLowerCase()],
      ['asc']
    )
    if (!isEmpty(oldBuildings) && !isEmpty(newbuildings) && oldBuildings.some(e => e.isExpanded === true) && newbuildings.some(c => oldBuildings.find(e => e.formiobuildingId === c.formiobuildingId && e.isExpanded === true))) {
      newbuildings.forEach(buildingItem => {
        const oldItem = oldBuildings.find(e => e.formiobuildingId === buildingItem.formiobuildingId)
        if (!isEmpty(oldItem) && oldItem.isExpanded && get(buildingItem, 'floors.length', 0)) {
          buildingItem.isExpanded = oldItem.isExpanded
          buildingItem.floors = orderBy(buildingItem.floors, [d => d.formioFloorName && d.formioFloorName.toLowerCase()], ['asc'])
          buildingItem.floors.forEach(floorItem => {
            floorItem.name = floorItem.formioFloorName
            const oldFloorItem = oldItem.floors.find(e => e.formiofloorId === floorItem.formiofloorId)
            if (!isEmpty(oldFloorItem) && oldFloorItem.isExpanded && get(floorItem, 'rooms.length', 0)) {
              floorItem.isExpanded = oldFloorItem.isExpanded
              floorItem.rooms = orderBy(floorItem.rooms, [d => d.formioRoomName && d.formioRoomName.toLowerCase()], ['asc'])
              floorItem.rooms.forEach(roomItem => {
                roomItem.formiobuildingId = floorItem.formiobuildingId
                roomItem.name = roomItem.formioRoomName
              })
            }
          })
        }
      })
    } else {
      newbuildings.forEach(buildingItem => {
        buildingItem.floors = orderBy(buildingItem.floors, [d => d.formioFloorName && d.formioFloorName.toLowerCase()], ['asc'])
        buildingItem.floors.forEach(floorItem => {
          floorItem.name = floorItem.formioFloorName
          floorItem.rooms = orderBy(floorItem.rooms, [d => d.formioRoomName && d.formioRoomName.toLowerCase()], ['asc'])
          floorItem.rooms.forEach(roomItem => {
            roomItem.name = roomItem.formioRoomName
          })
        })
      })
    }
    setBuilding(newbuildings)
    return newbuildings
  }
  const { initialLoading, reFetch } = useFetchData({ fetch: locations.get, formatter: d => formatBuildings(get(d, 'data.buildings', [])), defaultValue: [] })

  const postSuccess = () => {
    setOpenDelete({ isDelete: false })
    reFetch()
  }
  const postError = () => {
    reFetch()
  }

  const { loading: deleteLoading, mutate: deleteLocation } = usePostData({ executer: locations.deleteLocationDetails, postSuccess, postError, message: { success: 'Location Deleted Successfully !', error: 'Something Went Wrong !' } })
  const handleDeleteLocation = () => deleteLocation({ formiobuildingId: deleteItem.formiobuildingId, formiofloorId: deleteItem.formiofloorId, formioroomId: deleteItem.formioroomId })

  const handleCheckBoxChange = (e, data) => {
    if (isEmpty(selected)) {
      isEmpty(data.sublevelcomponentAssetId) ? setEditCheckbox({ asset: true, subAsset: false }) : setEditCheckbox({ asset: false, subAsset: true })
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

  const handleCheckedAll = (e, data) => {
    if (isEmpty(selected)) {
      isEmpty(data.sublevelcomponentAssetId) ? setEditCheckbox({ asset: true, subAsset: false }) : setEditCheckbox({ asset: false, subAsset: true })
    }
    setShowTopLevel(false)
    const assetIds = get(data, 'assets', []).map(p => p.assetId)
    if (e.target.checked) setSelected(p => [...p, ...assetIds])
    else setSelected(p => p.filter(d => !assetIds.includes(d)))
  }

  useEffect(() => {
    if (isEmpty(selected)) setEditCheckbox({ asset: true, subAsset: true })
  }, [selected])

  const handleBuildingFloorRoomEdit = value => {
    setOpen({ isAdd: false, isEdit: true })
    setEditFields(value)
  }
  const handleBuildingDelete = value => {
    setOpenDelete({ isDelete: true, name: 'Building' })
    setDeleteItem({ formiobuildingId: value.formiobuildingId, formiofloorId: 0, formioroomId: 0 })
  }
  const handleFloorDelete = value => {
    setOpenDelete({ isDelete: true, name: 'Floor' })
    setDeleteItem({ formiobuildingId: 0, formiofloorId: value.formiofloorId, formioroomId: 0 })
  }
  const handleRoomDelete = value => {
    setOpenDelete({ isDelete: true, name: 'Room' })
    setDeleteItem({ formiobuildingId: 0, formiofloorId: 0, formioroomId: value.formioroomId })
  }

  const handleSection = (e, value) => {
    setOpen({ isSection: true })
    setSectionFields(value)
  }
  const handleCancel = () => {
    setEditMode(false)
    setSelected([])
  }
  //
  return (
    <div style={{ background: '#fff', height: 'calc(100vh - 200px)', paddingTop: '10px' }}>
      {!userRole.isExecutive() && (
        <div className='d-flex align-items-center' style={{ width: '100%', marginBottom: '10px' }}>
          {!isEditMode && <MinimalButton onClick={() => setOpen({ isAdd: true, isEdit: false })} text='Location' size='small' startIcon={<AddIcon fontSize='small' />} variant='contained' color='primary' baseClassName='nf-buttons mr-2' />}
          {!isEditMode && <MinimalButton onClick={() => setEditMode(true)} text='Move Assets' size='small' startIcon={<EditOutlinedIcon fontSize='small' />} variant='contained' color='primary' baseClassName='nf-buttons' />}
          {isEditMode && <MinimalButton onClick={handleCancel} text='Cancel' size='small' variant='contained' color='default' baseClassName='nf-buttons mr-2' />}
          {isEditMode && <MinimalButton onClick={() => setMoveOpen(true)} text='Move' size='small' startIcon={<ArrowForwardOutlinedIcon fontSize='small' />} disabled={isEmpty(selected)} variant='contained' color='primary' baseClassName='nf-buttons' />}
        </div>
      )}
      <div className='text-bold border-bottom py-1'>Buildings</div>
      <div className='border-bottom py-1' style={{ display: 'grid', gridTemplateColumns: 'auto 250px 250px 250px 120px' }}>
        <div className='text-bold pl-2'>Name</div>
        <div className='text-bold'>Floor Count</div>
        <div className='text-bold'>Room Count</div>
        <div className='text-bold'>Asset Count</div>
        <div className='text-bold'>Actions</div>
      </div>
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ minHeight: '75%', height: 'calc(100vh - 305px)', position: 'relative', overflowX: 'hidden' }}>
        {initialLoading ? (
          <Loader />
        ) : isEmpty(buildings) ? (
          <div className='text-bold Pendingtbl-no-datafound' style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            No data found !
          </div>
        ) : (
          buildings.map(building => (
            <BuildingFloorRoomCount data={building} key={building.formiobuildingId} isEditMode={isEditMode} expand={handleExpandBuilding} editLocation={() => handleBuildingFloorRoomEdit(building)} deleteLocation={() => handleBuildingDelete(building)} buildingCount isBuilding>
              <FloorListHeader />
              {get(building, 'floors', []).map(floor => (
                <BuildingFloorRoomCount data={floor} key={floor.formiofloorId} isEditMode={isEditMode} expand={handleExpandFloor} offset='40px' editLocation={() => handleBuildingFloorRoomEdit(floor)} deleteLocation={() => handleFloorDelete(floor)} width='calc(100% - 40px)' isFloor>
                  <RoomListHeader />
                  {get(floor, 'rooms', []).map(room => (
                    <BuildingFloorRoomCount data={room} key={room.formioroomId} isEditMode={isEditMode} expand={handleExpandRoom} offset='40px' editLocation={() => handleBuildingFloorRoomEdit(room)} deleteLocation={() => handleRoomDelete(room)} roomCount width='calc(100% - 40px)' isRoom>
                      {!isEmpty(get(room, 'assets', [])) && <AssetListHeader data={room} isEditMode={isEditMode} editCheckbox={handleCheckedAll} checked={selected} checkHide={editCheckbox.asset} />}
                      {get(room, 'assets', []).map(asset => (
                        <AssetItem key={asset.assetId} data={asset} isEditMode={isEditMode} expand={handleExpandAsset} offset='40px' editCheckbox={handleCheckBoxChange} directMove={handleMoveDirect} checked={selected} checkHide={editCheckbox.asset} editSection={e => handleSection(e, asset)}>
                          {get(asset, 'subLevelComponents', []).map(subAsset => (
                            <AssetItem key={subAsset.sublevelcomponentAssetId} data={subAsset} isEditMode={isEditMode} offset='40px' editCheckbox={handleCheckBoxChange} directMove={handleMoveDirect} checked={selected} checkHide={editCheckbox.subAsset} width='calc(100% - 40px)' editSection={e => handleSection(e, subAsset)} />
                          ))}
                        </AssetItem>
                      ))}
                    </BuildingFloorRoomCount>
                  ))}
                </BuildingFloorRoomCount>
              ))}
            </BuildingFloorRoomCount>
          ))
        )}
      </div>
      {open.isAdd && <AddEditLocation open={open.isAdd} onClose={() => setOpen({ isAdd: false, isEdit: false })} option={buildings} reFetch={reFetch} />}
      {open.isEdit && <AddEditLocation open={open.isEdit} onClose={() => setOpen({ isAdd: false, isEdit: false })} editFields={editFields} option={buildings} isEdit={true} reFetch={reFetch} />}
      {isMoveOpen && <AddEditLocation open={isMoveOpen} onClose={() => setMoveOpen(false)} option={buildings} reFetch={reFetch} isChange={isMoveOpen} selectedAsset={selected} resetSelection={() => setSelected([])} showTopLevel={showTopLevel} setEditMode={setEditMode} />}
      {open.isSection && <EditSection open={open.isSection} onClose={() => setOpen({ isSection: false })} option={buildings} reFetch={reFetch} editSection={sectionFields} />}
      <DialogPrompt title={`Delete ${openDelete.name}`} text={`Are you sure you want to delete this ${openDelete.name}?`} actionLoader={deleteLoading} open={openDelete.isDelete} action={handleDeleteLocation} ctaText='Delete' handleClose={() => setOpenDelete({ isDelete: false })} />
    </div>
  )
}

export default Locations
