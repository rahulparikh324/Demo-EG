import React from 'react'

import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined'
import EditOutlinedIcon from '@material-ui/icons/EditOutlined'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import Skeleton from '@material-ui/lab/Skeleton'
import CircularProgress from '@material-ui/core/CircularProgress'
import Checkbox from '@material-ui/core/Checkbox'
import ArrowForwardOutlinedIcon from '@material-ui/icons/ArrowForwardOutlined'
import LayersOutlinedIcon from '@material-ui/icons/LayersOutlined'
import MeetingRoomOutlinedIcon from '@material-ui/icons/MeetingRoomOutlined'
import BusinessOutlinedIcon from '@material-ui/icons/BusinessOutlined'

import { ActionButton } from 'components/common/buttons'
import { AssetTypeIcon } from 'components/common/others'

import getUserRole from 'helpers/getUserRole'
import { isEmpty } from 'lodash'
import { Tooltip } from '@material-ui/core'

export const BuildingFloorRoom = ({ data, isEditMode, expand, children, offset, editLocation, deleteLocation = () => {}, editable = true, isBuilding, isFloor, isRoom, deletable = true }) => {
  const userRole = new getUserRole()
  return (
    <div>
      <div key={data.name} className='border-bottom py-1 align-items-center label-container' style={{ display: 'grid', gridTemplateColumns: 'auto 100px' }}>
        <div className='d-flex align-items-center' style={{ marginLeft: offset || 0 }}>
          {data.isExpanded ? (
            <ActionButton hide={!isEmpty(data.roomName) && isEmpty(data.assets)} action={() => expand(data)} tooltip='COLLAPSE' icon={<ExpandMoreIcon fontSize='small' />} />
          ) : (
            <ActionButton isLoading={data.loading} action={() => expand(data)} tooltip='EXPAND' icon={<ChevronRightIcon fontSize='small' hide={children?.length} />} hide={!children?.length} />
          )}
          <div className='text-xs label-container'>
            {isBuilding && <BusinessOutlinedIcon fontSize='small' style={{ marginRight: '5px', color: '#474747' }} />}
            {isFloor && <LayersOutlinedIcon fontSize='small' style={{ marginRight: '5px', color: '#474747' }} />}
            {isRoom && <MeetingRoomOutlinedIcon fontSize='small' style={{ marginRight: '5px', color: '#474747' }} />}
            {data.name}
            {!userRole.isExecutive() && (
              <span className='hover-lable-button' style={{ marginLeft: '10px' }}>
                {editable && <ActionButton hide={isEditMode} tooltip='EDIT' action={e => editLocation(e, 'EDIT')} icon={<EditOutlinedIcon fontSize='small' style={{ width: '18px', height: '18px' }} />} />}
                {deletable && <ActionButton hide={isEditMode} tooltip='DELETE' action={e => deleteLocation(e, 'DELETE')} icon={<DeleteOutlineOutlinedIcon fontSize='small' style={{ color: '#FF0000', width: '18px', height: '18px' }} />} />}
              </span>
            )}
          </div>
        </div>
      </div>
      {data.isExpanded && children}
    </div>
  )
}

export const BuildingFloorRoomCount = ({ data, isEditMode, expand, children, offset, editLocation, deleteLocation = () => {}, editable = true, buildingCount = false, roomCount = false, width, isBuilding, isFloor, isRoom }) => {
  const userRole = new getUserRole()
  const hideExpand = isBuilding ? data?.floorCount === 0 : isFloor ? data?.roomCount === 0 : isRoom ? data?.assetCount === 0 : false
  return (
    <div style={{ width: width || '100%', marginLeft: offset || 0 }}>
      <div key={data.name} className={`${!data.isExpanded ? 'border-bottom' : ''} py-1 align-items-center`} style={{ display: 'grid', gridTemplateColumns: 'auto 250px 250px 250px 120px' }}>
        <div className='d-flex align-items-center text-align-center'>
          {data.isExpanded ? <ActionButton hide={!isEmpty(data.formioRoomName) && isEmpty(data.assets)} action={() => expand(data)} tooltip='COLLAPSE' icon={<ExpandMoreIcon fontSize='small' />} /> : <ActionButton hide={hideExpand} isLoading={data.loading} action={() => expand(data)} tooltip='EXPAND' icon={<ChevronRightIcon fontSize='small' />} />}
          <div className='text-xs'>
            {isBuilding && <BusinessOutlinedIcon fontSize='small' style={{ marginRight: '5px', color: '#474747' }} />}
            {isFloor && <LayersOutlinedIcon fontSize='small' style={{ marginRight: '5px', color: '#474747' }} />}
            {isRoom && <MeetingRoomOutlinedIcon fontSize='small' style={{ marginRight: '5px', color: '#474747' }} />}
            {data.name}
          </div>
        </div>
        <div className='d-flex align-items-center'>{buildingCount && <div className='text-xs'>{data?.floorCount}</div>}</div>
        <div className='d-flex align-items-center'>{!roomCount && <div className='text-xs'>{data?.roomCount}</div>}</div>
        <div className='d-flex align-items-center'>
          <div className='text-xs'>{data?.assetCount}</div>
        </div>
        {!userRole.isExecutive() && (
          <div className='d-flex align-items-center'>
            {editable && <ActionButton hide={isEditMode} tooltip='EDIT' action={e => editLocation(e, 'EDIT')} icon={<EditOutlinedIcon fontSize='small' />} />}
            <ActionButton hide={isEditMode} tooltip='DELETE' action={e => deleteLocation(e, 'DELETE')} icon={<DeleteOutlineOutlinedIcon fontSize='small' style={{ color: '#FF0000' }} />} />
          </div>
        )}
      </div>
      {data.isExpanded && children}
    </div>
  )
}

export const AssetItem = ({ data, isEditMode, expand, children, offset, editCheckbox, checked, checkHide, editSection, offsetSection, width, directMove, isColumnView = false }) => {
  const userRole = new getUserRole()
  const handleAssetClick = () => {
    if (userRole.isExecutive()) return
    isEmpty(data.sublevelcomponentAssetId) ? window.open(`../assets/details/${data.assetId}`, '_blank') : window.open(`../assets/details/${data.sublevelcomponentAssetId}`, '_blank')
  }
  const handleAction = (e, type) => {
    e.stopPropagation()
    if (type === 'EXPCP') expand(data)
    if (type === 'EDIT-SEC') editSection()
    if (type === 'MOVE') directMove(e, data)
  }

  return (
    <div style={{ marginLeft: offset || 0 }}>
      <div onClick={handleAssetClick} className='border-bottom py-1 align-items-center table-with-row-click' style={{ display: 'grid', gridTemplateColumns: isColumnView ? 'auto 145px 75px' : 'auto 250px 120px', height: '35px' }}>
        <div className='d-flex align-items-center'>
          {data.isExpanded ? <ActionButton action={e => handleAction(e, 'EXPCP')} tooltip='COLLAPSE' icon={<ExpandMoreIcon fontSize='small' />} /> : <ActionButton hide={isEmpty(data.subLevelComponents)} isLoading={data.loading} action={e => handleAction(e, 'EXPCP')} tooltip='EXPAND' icon={<ChevronRightIcon fontSize='small' />} />}
          {isEditMode && checkHide && <Checkbox color='primary' size='small' checked={isEmpty(data.sublevelcomponentAssetId) ? checked.includes(data?.assetId) : checked.includes(data?.sublevelcomponentAssetId)} style={{ padding: 0 }} onClick={e => e.stopPropagation()} onChange={e => editCheckbox(e, data)} />}
          <div className='text-xs ml-2 d-flex'>
            <AssetTypeIcon type={data?.assetClassType} />
            <Tooltip title={data.name} placement='top'>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{data.name}</span>
            </Tooltip>
          </div>
        </div>
        <div className='d-flex align-items-center' style={{ marginLeft: offsetSection || 0 }}>
          <div className='text-xs mr-1'>{isEmpty(data.sublevelcomponentAssetId) ? data.section : data.formioSectionName}</div>
          {!userRole.isExecutive() && <ActionButton hide={isEditMode} tooltip='EDIT' action={e => handleAction(e, 'EDIT-SEC')} icon={<EditOutlinedIcon style={{ fontSize: '14px' }} />} />}
        </div>
        <div className='d-flex align-items-center' style={{ marginLeft: offsetSection || 0 }}>
          {!userRole.isExecutive() && <ActionButton hide={isEditMode} tooltip='MOVE' action={e => handleAction(e, 'MOVE')} icon={<ArrowForwardOutlinedIcon fontSize='small' />} />}
        </div>
      </div>
      {data.isExpanded && children}
    </div>
  )
}

export const AssetListHeader = ({ data, isEditMode, editCheckbox, checkHide }) => {
  return (
    <div className='align-items-center' style={{ display: 'grid', gridTemplateColumns: 'auto 250px 120px', paddingLeft: '66px', height: '35px' }}>
      <div className='d-flex align-items-center'>
        {isEditMode && checkHide && <Checkbox color='primary' size='small' checked={data.assetId} style={{ padding: 0 }} onClick={e => e.stopPropagation()} onChange={e => editCheckbox(e, data)} />}
        <div className='text-bold ml-2 '>Assets</div>
      </div>
      <div className='text-bold'>Section</div>
      <div className='text-bold'>Actions</div>
    </div>
  )
}
export const FloorListHeader = () => {
  return (
    <>
      <div className='text-bold' style={{ paddingLeft: '45px', marginTop: '6px' }}>
        Floors
      </div>
      <div className='py-1 align-items-center' style={{ display: 'grid', gridTemplateColumns: 'auto 250px 250px 120px', paddingLeft: '37px', height: '43px' }}>
        <div className='text-bold ml-2 border-bottom '>Name</div>
        <div className='text-bold border-bottom '>Room Count</div>
        <div className='text-bold border-bottom '>Asset Count</div>
        <div className='text-bold border-bottom '>Actions</div>
      </div>
    </>
  )
}
export const RoomListHeader = () => {
  return (
    <>
      <div className='text-bold ' style={{ paddingLeft: '45px', marginTop: '6px' }}>
        Rooms
      </div>
      <div className='py-1 align-items-center' style={{ display: 'grid', gridTemplateColumns: 'auto 250px 120px', paddingLeft: '37px', height: '43px' }}>
        <div className='text-bold ml-2 border-bottom '>Name</div>
        <div className='text-bold border-bottom '>Asset Count</div>
        <div className='text-bold border-bottom '>Actions</div>
      </div>
    </>
  )
}

export const Loader = () => (
  <div>
    {[...Array(25)].map((x, index) => (
      <div key={index} className='border-bottom py-1 align-items-center' style={{ display: 'grid', gridTemplateColumns: 'auto 250px 250px 250px 120px', gap: '16px' }}>
        <Skeleton variant='text' animation='wave' />
        <Skeleton variant='text' animation='wave' />
        <Skeleton variant='text' animation='wave' />
        <Skeleton variant='text' animation='wave' />
        <Skeleton variant='text' animation='wave' />
      </div>
    ))}
  </div>
)

export const AssetLineItem = ({ asset, offset, isLoading, onClick = () => {}, expand = () => {}, children, subAsset = false }) => {
  const handleExpand = e => {
    e.stopPropagation()
    expand(asset)
  }
  const handleClick = e => {
    if (asset.isDummy) return
    onClick(asset)
  }
  return (
    <div>
      <div className={`border-bottom py-1 d-flex justify-content-between align-items-center ${asset.isDummy ? 'text-bold' : 'table-with-row-click'}`} onClick={handleClick} style={{ height: '35px' }}>
        <div className='d-flex align-items-center' style={{ marginLeft: offset || 0, height: '100%' }}>
          {asset.isExpanded ? <ActionButton hide={isEmpty(asset.subComponents)} action={handleExpand} tooltip='COLLAPSE' icon={<ExpandMoreIcon fontSize='small' />} /> : <ActionButton hide={isEmpty(asset.subComponents)} action={handleExpand} tooltip='EXPAND' icon={<ChevronRightIcon fontSize='small' />} />}
          <div className='text-xs d-flex'>
            <AssetTypeIcon type={asset?.assetClassType} /> {subAsset ? <i>{asset.name}</i> : asset.name}
          </div>
        </div>
        {isLoading && <CircularProgress size={19} thickness={5} style={{ marginRight: '75px', marginLeft: '6px' }} />}
      </div>
      {asset.isExpanded && children}
    </div>
  )
}
