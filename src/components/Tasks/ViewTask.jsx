import React from 'react'
import Drawer from '@material-ui/core/Drawer'
import { FormTitle } from '../Maintainance/components'

function ViewTask({ open, onClose, viewObj }) {
  // console.log(viewObj)
  const LabelVal = ({ label, value, w }) => (
    <div style={{ width: `${w}%` }}>
      <div style={{ fontWeight: 600 }}>{label} : </div>
      <div style={{ wordWrap: 'break-word' }}>{value}</div>
    </div>
  )

  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title='View Task' closeFunc={onClose} style={{ width: '100%', minWidth: '450px' }} />
      <div style={{ padding: '10px', height: '100%', background: '#efefef', width: '450px' }}>
        <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
          <div style={{ fontWeight: 600, marginBottom: '15px', wordWrap: 'break-word' }}>{`#${viewObj.task_code} ${viewObj.task_title}`} </div>
          <LabelVal w={100} label='Description' value={viewObj.description} />
          <div className='my-2'>
            <LabelVal w={100} label='Notes' value={viewObj.notes} />
          </div>
        </div>
        <div style={{ padding: '16px', background: '#fff', borderRadius: '4px', marginTop: '16px' }}>
          <LabelVal w={100} label='Form' value={viewObj.form_name} />
        </div>
        {/* <div style={{ padding: '16px', background: '#fff', borderRadius: '4px', marginTop: '16px' }}>
          <div style={{ fontWeight: 600 }}>Linked Assets </div>
          {viewObj.assetTasks.map((asset, i) => (
            <div key={i}>{asset.asset_name}</div>
          ))}
        </div> */}
      </div>
    </Drawer>
  )
}

export default ViewTask
