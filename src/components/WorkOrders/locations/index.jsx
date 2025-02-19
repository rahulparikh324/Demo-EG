import { useState, useEffect } from 'react'
import useFetchData from 'hooks/fetch-data'
import usePostData from 'hooks/post-data'

import AddIcon from '@material-ui/icons/Add'

import { DropDownMenu } from 'components/common/others'
import { BuildingFloorRoom, AssetLineItem, Loader } from 'components/locations/components'
import { MinimalButton } from 'components/common/buttons'
import DialogPrompt from 'components/DialogPrompt'

import { get, isEmpty, orderBy } from 'lodash'
import enums from 'Constants/enums'
import { Toast } from 'Snackbar/useToast'

import Add from 'components/WorkOrders/locations/add'

import locations from 'Services/locations'
import { normalizeString } from '../utils'
import EditLocation from './edit'

const Locations = ({ woId, searchString, data, handleAddAssetInLocation, viewAsset, actionLoader, rows = [], isAddDisabled, addCTA = 'Add Asset', reFetchCount, isShowWoDetails, isQuote, reFetchLocations }) => {
  const dropDownMenuOptions = [
    {
      id: 1,
      type: 'button',
      text: 'Create New Location',
      disabled: data.woStatusId === enums.woTaskStatus.Complete || (isQuote && data?.quoteStatusId === enums.QUOTES.STATUS.ACCEPTED) || (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.DEFERRED) || (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.REJECTED),
      onClick: () => handleAddLocation(true),
      show: true,
    },
    { id: 2, type: 'button', text: 'Existing Location', disabled: data.woStatusId === enums.woTaskStatus.Complete || (isQuote && data?.quoteStatusId === enums.QUOTES.STATUS.ACCEPTED), onClick: () => handleAddLocation(false), show: true },
  ]
  //
  const [buildings, setBuilding] = useState([])
  const [isAddOpen, setAddOpen] = useState(false)
  const [isEditOpen, setEditOpen] = useState(false)
  const [isAddingNew, setAddingNew] = useState(false)
  const [isDeleteOpen, setDeleteOpen] = useState(false)
  const [locationToDelete, setLocationToDelete] = useState({})
  const [fetchUpdater, setFetchUpdater] = useState(0)
  const [isExpandAll, setExpandAll] = useState(true)
  const [editFields, setEditFields] = useState([])

  // const [searchString, setSearchString] = useState('')
  // expand/collapse
  const handleExpandBuilding = building => {
    const oldBuildings = [...buildings]
    const current = oldBuildings.find(d => normalizeString(d.buildingName) === normalizeString(building.buildingName))
    const floors = current.tempMasterFloor
    floors.forEach(d => {
      d.name = d.floorName
      d.isExpanded = false
    })
    current.isExpanded = !current.isExpanded
    setBuilding(oldBuildings)
  }
  const handleExpandFloor = floor => {
    const oldBuildings = [...buildings]
    const currentB = oldBuildings.find(d => normalizeString(d.buildingName) === normalizeString(floor.buildingName))
    const current = get(currentB, 'tempMasterFloor', []).find(d => normalizeString(d.floorName) === normalizeString(floor.floorName))
    const rooms = current.tempMasterRooms
    rooms.forEach(d => {
      d.tempMasterBuildingId = floor.tempMasterBuildingId
      d.name = d.roomName
      d.isExpanded = false
    })
    current.isExpanded = !current.isExpanded
    setBuilding(oldBuildings)
  }
  const handleExpandRoom = async room => {
    try {
      if (!isEmpty(room.assets)) return updateRoom(room, false, !room.isExpanded, room.assets)
      updateRoom(room, true)
      const res = await locations.workOrderV2.getAssets({ woId, tempMasterRoomId: room.tempMasterRoomId })
      if (res.success) {
        const assets = orderBy(
          get(res, 'data.list', []).map(d => ({
            ...d,
            name: d.assetName,
            tempMasterBuildingId: room.tempMasterBuildingId,
            tempMasterFloorId: room.tempMasterFloorId,
            tempMasterRoomId: room.tempMasterRoomId,
            tempFormioBuildingName: room.tempFormioBuildingName,
            tempFormioFloorName: room.tempFormioFloorName,
            tempFormioRoomName: room.tempFormioRoomName,
          })),
          [d => d.name && d.name.toLowerCase()],
          ['asc']
        )
        const topLevelAssets = assets.filter(d => d.componentLevelTypeId === enums.COMPONENT_TYPE.TOP_LEVEL)
        let subComponentAssets = assets.filter(d => d.componentLevelTypeId === enums.COMPONENT_TYPE.SUB_COMPONENT)
        topLevelAssets.forEach(d => {
          const subComponents = []
          subComponentAssets.forEach(sub => {
            if ([d.woonboardingassetsId, d.assetId].includes(sub.toplevelcomponentAssetId) && sub.componentLevelTypeId === enums.COMPONENT_TYPE.SUB_COMPONENT) subComponents.push(sub)
          })
          subComponentAssets = subComponentAssets.filter(d => !subComponents.map(x => x.woonboardingassetsId).includes(d.woonboardingassetsId))
          d.subComponents = subComponents
          d.isExpanded = false
        })
        topLevelAssets.push({
          name: 'Top-Level Component not present in this workorder',
          woonboardingassetsId: 'no-top-level',
          isExpanded: false,
          isDummy: true,
          subComponents: subComponentAssets,
          tempFormiobuildingId: room.tempFormiobuildingId,
          tempFormiofloorId: room.tempFormiofloorId,
          tempFormioroomId: room.tempFormioroomId,
        })
        updateRoom(room, false, true, topLevelAssets)
      } else throw new Error()
    } catch (error) {
      updateRoom(room, false, false, [])
      Toast.error(`Error fetching assets. Please try again !`)
    }
  }
  const updateRoom = (room, loading, isExpanded, assets) => {
    const oldBuildings = structuredClone(buildings)
    const currentB = oldBuildings.find(d => normalizeString(d.buildingName) === normalizeString(room.buildingName))
    const currentF = get(currentB, 'tempMasterFloor', []).find(d => normalizeString(d.floorName) === normalizeString(room.floorName))
    const current = get(currentF, 'tempMasterRooms', []).find(d => normalizeString(d.roomName) === normalizeString(room.roomName))
    current.loading = loading
    current.isExpanded = current.isExpanded ? false : isExpanded
    current.assets = assets
    setBuilding(oldBuildings)
  }
  const handleExpandAsset = asset => {
    const oldBuildings = structuredClone(buildings)
    const currentB = oldBuildings.find(d => normalizeString(d.buildingName) === normalizeString(asset.tempMasterBuilding))
    const currentF = get(currentB, 'tempMasterFloor', []).find(d => normalizeString(d.floorName) === normalizeString(asset.tempMasterFloor))
    const currentR = get(currentF, 'tempMasterRooms', []).find(d => normalizeString(d.roomName) === normalizeString(asset.tempMasterRoom))
    const current = get(currentR, 'assets', []).find(d => d.woonboardingassetsId === asset.woonboardingassetsId)
    current.isExpanded = !current.isExpanded
    setBuilding(oldBuildings)
  }
  // get data
  const formatBuildings = (list, isExpandAll) => {
    // const oldBuildings = structuredClone(buildings)
    const newbuildings = orderBy(
      [...list].map(d => ({ ...d, isExpanded: isExpandAll, name: d.buildingName, label: d.buildingName, value: d.tempMasterBuildingId })),
      [d => d.name && d.name.toLowerCase()],
      ['asc']
    )
    if (!isEmpty(newbuildings)) {
      newbuildings.map(buildingItem => {
        // const oldItem = oldBuildings.find(e => e.tempFormiobuildingId === buildingItem.tempFormiobuildingId)
        if (get(buildingItem, 'tempMasterFloor.length', 0)) {
          buildingItem.isExpanded = isExpandAll
          buildingItem.tempMasterFloor = orderBy(buildingItem.tempMasterFloor, [d => d.floorName && d.floorName.toLowerCase()], ['asc'])
          buildingItem.tempMasterFloor.map(floorItem => {
            floorItem.name = floorItem.floorName
            floorItem.tempMasterBuildingId = buildingItem.tempMasterBuildingId
            // const oldFloorItem = oldItem.tempFloors.find(e => e.tempFormiofloorId === floorItem.tempFormiofloorId)
            if (get(floorItem, 'tempMasterRooms.length', 0)) {
              floorItem.isExpanded = isExpandAll
              floorItem.tempMasterRooms = orderBy(floorItem.tempMasterRooms, [d => d.roomName && d.roomName.toLowerCase()], ['asc'])
              floorItem.tempMasterRooms.map(roomItem => {
                roomItem.tempMasterBuildingId = floorItem.tempMasterBuildingId
                roomItem.tempMasterFloorId = floorItem.tempMasterFloorId
                roomItem.name = roomItem.roomName
              })
            }
          })
        }
      })
    }
    // const defaultBuildingIndex = newbuildings.findIndex(item => item.name === 'Default')

    // if (defaultBuildingIndex !== -1) {
    //   const defaultBuilding = newbuildings.splice(defaultBuildingIndex, 1)[0]
    //   newbuildings.push(defaultBuilding)
    // }
    setBuilding(newbuildings)
    // setTempBuildings(newbuildings)
    setFetchUpdater(p => p + 1)
    // reFetchCount()
    return newbuildings
  }
  const { initialLoading, reFetch } = useFetchData({ fetch: locations.workOrderV2.get, payload: { wo_id: woId }, formatter: d => formatBuildings(get(d, 'data.tempMasterBuildings', []), isExpandAll), defaultValue: [] })
  useEffect(() => {
    if (fetchUpdater !== 0) {
      reFetch()
    }
  }, [rows.length])

  useEffect(() => {
    if (fetchUpdater !== 0) {
      reFetchLocations()
    }
  }, [fetchUpdater])

  //
  const handleAddAsset = data => handleAddAssetInLocation({ building: data.building.tempFormiobuildingId, floor: data.floor.tempFormiofloorId, room: data.room.tempFormioroomId, buildingName: data.building.name, floorName: data.floor.name, roomName: data.room.name })
  const handleAddLocation = isNew => {
    setAddingNew(isNew)
    setAddOpen(true)
  }
  const postSuccess = () => {
    setDeleteOpen(false)
    reFetch()
    reFetchCount()
  }
  const { loading: deleteLoading, mutate: deleteLocation } = usePostData({ executer: locations.workOrder.delete, postError: reFetch, postSuccess, message: { success: 'Location Deleted Successfully !', error: 'Something went wrong' } })

  const handleEditLocation = data => {
    setEditFields(data)
    setEditOpen(true)
  }

  const handleDeleteLocation = data => {
    setLocationToDelete({ ...data, wo_id: woId })
    setDeleteOpen(true)
  }

  const handleToggle = () => {
    if (allExpanded) {
      setExpandAll(false)
    } else {
      setExpandAll(true)
    }

    reFetch()
  }
  const allExpanded = buildings.every(building => building.isExpanded)
  return (
    <div>
      <div className='d-flex flex-row align-items-center my-2 justify-content-between' style={{ width: '100%' }}>
        <DropDownMenu btnText='Add Location' dropDownMenuOptions={dropDownMenuOptions} />
        {/* <MinimalButton onClick={handleAddLocation} text='Add Location' size='small' variant='contained' color='primary' baseClassName='nf-buttons' disabled={data.woStatusId === enums.woTaskStatus.Complete || (isQuote && data?.quoteStatusId === enums.QUOTES.STATUS.ACCEPTED)} /> */}
        <MinimalButton onClick={handleToggle} text={allExpanded ? 'Collapse All' : 'Expand All'} size='small' variant='contained' color='primary' baseClassName='nf-buttons ml-2' />
        {/* <SearchComponent searchString={searchString} setSearchString={setSearchString} /> */}
      </div>
      <div className='border-bottom py-1' style={{ display: 'grid', gridTemplateColumns: 'auto 100px' }}>
        <div className='text-bold'>Active Locations</div>
        {/* <div className='text-bold'>Action</div> */}
      </div>
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ minHeight: '75%', height: isShowWoDetails ? 'calc(100vh - 475px)' : 'calc(100vh - 360px)', position: 'relative' }}>
        {initialLoading ? (
          <Loader />
        ) : isEmpty(buildings) ? (
          <div className='text-bold Pendingtbl-no-datafound' style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            No data found !
          </div>
        ) : (
          <>
            <div className='text-bold ml-2' style={{ marginTop: '6px' }}>
              Buildings
            </div>
            {buildings.map(building => (
              <BuildingFloorRoom
                data={building}
                key={building.tempMasterBuildingId}
                editLocation={() => handleEditLocation({ locationData: building, type: 1 })}
                deleteLocation={() =>
                  handleDeleteLocation({
                    temp_master_building_id: building.tempMasterBuildingId,
                    delete_location_flag: 1,
                  })
                }
                expand={handleExpandBuilding}
                editable={true}
                deletable={true}
                isBuilding
              >
                <div className='text-bold' style={{ marginLeft: '25px', marginTop: '6px' }}>
                  Floors
                </div>
                {get(building, 'tempMasterFloor', []).map(floor => (
                  <BuildingFloorRoom
                    data={floor}
                    key={floor.tempMasterFloorId}
                    expand={handleExpandFloor}
                    offset='16px'
                    editLocation={() => handleEditLocation({ locationData: floor, type: 2 })}
                    deleteLocation={() =>
                      handleDeleteLocation({
                        temp_master_building_id: building.tempMasterBuildingId,
                        temp_master_floor_id: floor.tempMasterFloorId,
                        delete_location_flag: 2,
                      })
                    }
                    editable={true}
                    deletable={true}
                    isFloor
                  >
                    <div className='text-bold' style={{ marginLeft: '42px', marginTop: '6px' }}>
                      Rooms
                    </div>
                    {get(floor, 'tempMasterRooms', []).map(room => (
                      <BuildingFloorRoom
                        data={room}
                        key={room.tempMasterRoomId}
                        expand={handleExpandRoom}
                        offset='32px'
                        editLocation={() => handleEditLocation({ locationData: room, type: 3 })}
                        deleteLocation={() =>
                          handleDeleteLocation({
                            temp_master_building_id: building.tempMasterBuildingId,
                            temp_master_floor_id: floor.tempMasterFloorId,
                            temp_master_room_id: room.tempMasterRoomId,
                            delete_location_flag: 3,
                          })
                        }
                        editable={true}
                        deletable={true}
                        isRoom
                      >
                        <div className='text-bold' style={{ marginLeft: '75px', marginTop: '6px' }}>
                          Assets
                        </div>
                        {get(room, 'assets', []).map(asset => (
                          <AssetLineItem key={asset.woonboardingassetsId} isLoading={actionLoader === asset.woonboardingassetsId} asset={asset} expand={() => handleExpandAsset(asset)} onClick={() => viewAsset(asset)} offset='64px'>
                            {get(asset, 'subComponents', []).map(sub => (
                              <AssetLineItem key={sub.woonboardingassetsId} isLoading={actionLoader === sub.woonboardingassetsId} asset={sub} onClick={() => viewAsset(sub)} offset='84px' subAsset />
                            ))}
                          </AssetLineItem>
                        ))}
                        {!isAddDisabled && <MinimalButton onClick={() => handleAddAsset({ building, floor, room })} text={addCTA} startIcon={<AddIcon fontSize='small' />} color='primary' baseClassName='xs-button ml-5' />}
                      </BuildingFloorRoom>
                    ))}
                  </BuildingFloorRoom>
                ))}
              </BuildingFloorRoom>
            ))}
          </>
        )}
      </div>
      {isAddOpen && <Add open={isAddOpen} reFetch={reFetch} woId={woId} onClose={() => setAddOpen(false)} isNew={isAddingNew} options={buildings} />}
      {isEditOpen && <EditLocation woId={woId} open={isEditOpen} onClose={() => setEditOpen(false)} isEdit={true} reFetch={reFetch} editFields={editFields} />}
      <DialogPrompt title='Delete Location' text='Are you sure you want to delete this location ?' actionLoader={deleteLoading} open={isDeleteOpen} action={() => deleteLocation(locationToDelete)} ctaText='Delete' handleClose={() => setDeleteOpen(false)} />
    </div>
  )
}

export default Locations
