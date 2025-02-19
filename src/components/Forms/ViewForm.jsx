import React from 'react'
import Drawer from '@material-ui/core/Drawer'
import { FormTitle } from '../Maintainance/components'
import { Form } from 'react-formio'

function ViewForm({ open, onClose, viewObj }) {
  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title='View Form' closeFunc={onClose} style={{ width: '100%', minWidth: '450px' }} />
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', background: '#efefef' }}>
        <div style={{ padding: '10px', width: '55vw' }}>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
            <Form form={viewObj} options={{ readOnly: true }} />
          </div>
        </div>
      </div>
    </Drawer>
  )
}

export default ViewForm
