import React, { useState, useEffect } from 'react'
import Modal from '@material-ui/core/Modal'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Button from '@material-ui/core/Button'
import { MinimalAutoComplete } from '../Assets/components'
import { Toast } from '../../Snackbar/useToast'
import CircularProgress from '@material-ui/core/CircularProgress'
import getAllTechnician from '../../Services/WorkOrder/getAllTechnician'
import assignTechnician from '../../Services/WorkOrder/assignTechnician'

function AssignTechinican({ open, onClose, obj, afterSubmit }) {
  const [loading, setLoading] = useState(false)
  const [technician, setTechnician] = useState(null)
  const [techOpts, setTechOpts] = useState([])
  const [technicianLoading, setTechnicianLoading] = useState(false)
  //fetching
  useEffect(() => {
    ;(async () => {
      setTechnicianLoading(true)
      try {
        const allTech = await getAllTechnician({ page_size: 0, page_index: 0 })
        setTechOpts(allTech.data.list.map(d => ({ label: `${d.first_name} ${d.last_name}`, value: d.user_id })))
      } catch (error) {
        setTechOpts([])
      }
      setTechnicianLoading(false)
    })()
  }, [])
  //submit
  const submitData = async () => {
    setLoading(true)
    try {
      const data = {
        wo_inspectionsTemplateFormIOAssignment_id: obj.wo_inspectionsTemplateFormIOAssignment_id,
        technician_user_id: technician.value,
      }
      // console.log(data)
      const res = await assignTechnician(data)
      if (res.success > 0) {
        Toast.success('Technician assigned successfully !')
      } else Toast.error(res.message)
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
    }
    setLoading(false)
    onClose()
    afterSubmit()
  }
  //
  const body = (
    <div style={modalStyle} className='add-task-modal'>
      <div className='d-flex flex-row justify-content-between align-items-center px-3 py-2' style={{ background: '#e0e0e080' }}>
        <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'EudoxusSans-Medium' }}>Assign Technician</div>
        <IconButton onClick={onClose} size='small'>
          <CloseIcon fontSize='small' />
        </IconButton>
      </div>
      <div className='px-3 py-2'>
        <div className='d-flex' style={{ width: '100%' }}>
          <MinimalAutoComplete placeholder='Select Technician' value={technician} onChange={setTechnician} options={techOpts} label='Technician' w={100} isClearable isLoading={technicianLoading} />
        </div>
      </div>
      <div className='content-bar bottom-bar'>
        <Button variant='contained' color='default' className='nf-buttons mr-2' disableElevation onClick={onClose}>
          Cancel
        </Button>
        <Button variant='contained' color='primary' onClick={submitData} className='nf-buttons' disableElevation style={{ marginLeft: '10px' }} disabled={loading || technician === null}>
          {loading ? 'Assigning...' : 'Assign'}
          {loading && <CircularProgress size={20} thickness={5} style={{ color: '#fff', marginLeft: '10px' }} />}
        </Button>
      </div>
    </div>
  )
  return (
    <Modal open={open} onClose={onClose} aria-labelledby='simple-modal-title' aria-describedby='simple-modal-description'>
      {body}
    </Modal>
  )
}
const modalStyle = {
  top: `50%`,
  left: `50%`,
  transform: `translate(-50%, -50%)`,
  position: 'absolute',
  background: '#fff',
  width: '45%',
}
export default AssignTechinican
