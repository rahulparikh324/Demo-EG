import React from 'react'

import Drawer from '@material-ui/core/Drawer'

import { FormTitle } from 'components/Maintainance/components'
import { LabelVal } from 'components/common/others'

import { get } from 'lodash'

import { getFormatedDate } from 'helpers/getDateTime'

const ViewEquipment = ({ open, onClose, obj }) => {
  const calibrationStatus = () => {
    if (obj.calibrationStatus === 1) return 'Calibrated'
    if (obj.calibrationStatus === 2) return 'Not Calibrated'
    if (obj.calibrationStatus === 3) return 'N/A'
  }
  const calibrationDate = () => {
    if (obj.calibrationDate) return getFormatedDate(obj.calibrationDate.split('T')[0])
    else return ''
  }
  return (
    <Drawer anchor='right' open={open} onClose={onClose} style={{ width: '100%' }}>
      <FormTitle title='View Equipment' closeFunc={onClose} style={{ width: '100%' }} />
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', background: '#efefef', width: '450px' }}>
        <div style={{ padding: '10px' }}>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
            <LabelVal label='ID#' value={get(obj, 'equipmentNumber', '')} inline />
            <LabelVal label='Name' value={get(obj, 'equipmentName', '')} />
            <div className='d-flex align-items-center'>
              <LabelVal label='Manufacturer' value={get(obj, 'manufacturer', '')} w={50} />
              <LabelVal label='Model Number' value={get(obj, 'modelNumber', '')} />
            </div>
            <div className='d-flex align-items-center'>
              <LabelVal label='Serial Number' value={get(obj, 'serialNumber', '')} w={50} />
              <LabelVal label='Calibration Interval' value={get(obj, 'calibrationInterval', '')} />
            </div>
            <div className='d-flex align-items-center'>
              <LabelVal label='Calibration Date' value={calibrationDate()} w={50} />
              <LabelVal label='Status' value={calibrationStatus()} />
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  )
}

export default ViewEquipment
