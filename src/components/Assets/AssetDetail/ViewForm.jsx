import React from 'react'
import Drawer from '@material-ui/core/Drawer'
import { FormTitle } from '../../Maintainance/components'
import { Form } from 'react-formio'
import { get, isEmpty } from 'lodash'

function ViewForm({ open, onClose, viewObj, equipmentListOptions }) {
  const formatFormData = () => {
    const data = JSON.parse(viewObj.asset_form_data)
    get(data, 'components', []).forEach(d => {
      if (d.key === 'footer') {
        const footerComp = d.components[0].components
        const finalFooter = footerComp.find(q => q.key === 'finalFooter')
        if (!isEmpty(finalFooter)) {
          const calibrationTable = finalFooter.components.find(x => x.key === 'testEquipmentCalibrationTable')
          if (!isEmpty(calibrationTable)) {
            if (!isEmpty(get(calibrationTable, 'components[0].data.values', ''))) {
              calibrationTable.components[0].data.values = equipmentListOptions.map(d => ({ ...d, label: d.equipmentNumber, value: d.equipmentId }))
            }
          }
        }
      }
    })
    return data
  }
  const form = formatFormData()
  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title={viewObj.asset_form_name} closeFunc={onClose} style={{ width: '100%', minWidth: '450px' }} />
      <div className='table-responsive dashboardtblScroll submitted-inspection-form' id='style-1' style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', background: '#efefef' }}>
        <div style={{ padding: '10px', width: '55vw' }}>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px', marginBottom: '10px' }}>
            <div style={{ fontWeight: 600 }}>Description :</div>
            <div>{viewObj.asset_form_description}</div>
          </div>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
            <Form form={form} submission={{ data: JSON.parse(viewObj.asset_form_data).data }} options={{ readOnly: true }} />
          </div>
        </div>
      </div>
    </Drawer>
  )
}

export default ViewForm
