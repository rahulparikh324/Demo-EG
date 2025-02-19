import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import { FormTitle } from '../Maintainance/components'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import _ from 'lodash'
import '../Maintainance/maintainance.css'
import clsx from 'clsx'
import { PriorityControl, NavigatLinkToNewTab } from './components'
import addRequest from '../../Services/Requests/addRequest'
import { Toast } from '../../Snackbar/useToast'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import IconButton from '@material-ui/core/IconButton'
import AddWOModal from './AddWOModal'
import DialogPrompt from '../DialogPrompt'
import { MinimalTextArea } from '../Assets/components'
import * as yup from 'yup'
import { validateSchema } from '../../helpers/schemaValidation'
import { useTheme } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  root: { padding: 0, flexGrow: 1, height: 'calc(100vh - 68px)' },
  paper: { padding: theme.spacing(2), color: theme.palette.text.primary },
  input: { margin: '16px 16px 0 16px', width: '92%' },
  radio: { margin: '16px 16px 0 16px', fontSize: '14px' },
  radioLabel: { fontSize: '14px', margin: 0 },
  containerDiv: { display: 'flex', justifyContent: 'space-between', flexDirection: 'column', height: '100%', width: '450px', background: '#efefef' },
  containerSubDiv: { borderRadius: '4px', margin: '8px', background: '#fff', display: 'flex', flexDirection: 'column', maxHeight: '830px', overflowY: 'scroll', '&::-webkit-scrollbar': { width: '0.2em' }, '&::-webkit-scrollbar-thumb': { background: '#e0e0e0' } },
  subTitile: { padding: '12px 16px', background: '#eee', fontSize: '16px', fontWeight: 500, border: '1px solid #d1d1d1', borderLeft: 0, borderRight: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  button: { padding: '4px 16px', borderRadius: '40px', margin: theme.spacing(1), margin: 0, textTransform: 'capitalize' },
  taskError: { color: 'red', textAlign: 'center' },
  paneHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #A6A6A6', padding: '12px' },
  button: { padding: '2px 14px', margin: theme.spacing(1), borderRadius: '16px', margin: 0, textTransform: 'capitalize' },
  formButtons: { padding: '6px 18px', borderRadius: '40px' },
  bottomBar: { borderTop: '1px solid #A6A6A6', borderBottom: 'none', background: '#fff', marginTop: 'auto' },
  listbox: {
    maxHeight: '180px',
    overflowY: 'scroll',
    '&::-webkit-scrollbar': {
      width: '0.4em',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#e0e0e0',
    },
    fontSize: '14px',
  },
  LoadingWrapper: { fontSize: 12 },
  badge: { transform: 'scale(0.8) translate(50%, -50%)' },
  inputRoot: {
    display: 'flex',
    flexDirection: 'Column',
    alignItems: 'flex-start',
    '&[class*="MuiOutlinedInput-root"] .MuiAutocomplete-input': {
      width: '100%',
    },
  },
}))
const styles = {
  labelStyle: { fontWeight: 800 },
  inputStyle: { background: 'none', padding: '10px 16px', border: '1px solid #a1a1a1' },
  labelError: { color: 'red', fontWeight: 800 },
  inputError: { background: '#ff000021', padding: '10px 16px', border: '1px solid red', color: 'red', marginBottom: '-5px' },
}
function EditRequest({ open, onClose, afterSubmit, editObj, createWO }) {
  const classes = useStyles()
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [priority, setPriority] = useState(45)
  const [errors, setErrors] = useState({})
  const [errorMsgs, setErrorMsgs] = useState({})
  const [loading, setLoading] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [isAssignWOModalOpen, setAssignWOModalOpen] = useState(false)
  const [linkedWO, setLinkedWO] = useState({})
  const [isUnlinkModelOpen, setUnlinkModalOpen] = useState(false)
  const theme = useTheme()
  //data loading

  useEffect(() => {
    editObj.description && setDesc(editObj.description)
    editObj.workOrders && setLinkedWO(editObj.workOrders)
    setTitle(editObj.title)
    setPriority(editObj.priority)
  }, [])

  //form functions
  const closeForm = () => {
    setTitle('')
    setDesc('')
    setPriority(45)
    onClose(false)
  }
  const validateForm = async () => {
    const schema = yup.object().shape({ desc: yup.string().required('Description is required !') })
    const payload = { desc }
    const isValid = await validateSchema(payload, schema)
    setErrors(isValid)
    if (isValid === true) createRequestBody()
  }
  const onFocus = key => setErrors({ ...errors, [key]: null })
  const createRequestBody = async () => {
    const req = {
      mr_id: editObj.mr_id,
      title,
      description: desc,
      asset_id: editObj.asset_id,
      priority,
      mr_type: editObj.mr_type,
      status: editObj.status,
      wo_id: linkedWO.wo_id,
    }
    setLoading(true)
    // console.log(req)
    submitData(req)
  }
  const submitData = async data => {
    try {
      const res = await addRequest(data)
      if (res.success > 0) Toast.success('Request updated successfully !')
      else Toast.error(res.message)
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
    }
    setLoading(false)
    closeForm()
    afterSubmit()
  }
  //
  const assignWorkOrder = () => {
    setAssignWOModalOpen(true)
    setAnchorEl(null)
  }
  const removeAction = () => {
    setUnlinkModalOpen(false)
    setLinkedWO({})
    setAnchorEl(null)
  }
  const createWO__ = () => {
    createWO(editObj)
    closeForm()
  }
  //
  return (
    <>
      <Drawer anchor='right' open={open} onClose={() => closeForm()}>
        <FormTitle title={title} closeFunc={() => closeForm()} />
        <div className={classes.containerDiv}>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px', margin: '10px' }}>
            <MinimalTextArea onFocus={e => onFocus('desc')} rows={3} value={desc} error={errors.desc} onChange={e => setDesc(e.target.value)} placeholder='Add Description ..' label='Description' w={100} labelStyles={errors.desc ? styles.labelError : styles.labelStyle} InputStyles={errors.desc ? styles.inputError : styles.inputStyle} />
            <PriorityControl value={priority} onChange={setPriority} />
          </div>

          <NavigatLinkToNewTab title='Asset Info' func={() => window.open(`assets/details/${editObj.asset.asset_id}`, '_blank')}>
            {editObj.asset && (
              <>
                <i>
                  <strong style={{ color: theme.palette.primary.main }}>#{editObj.asset.internal_asset_id}</strong> - {editObj.asset.name}
                </i>
                <div>
                  <i>
                    Current Meter Hours: <strong style={{ color: theme.palette.primary.main }}>{editObj.asset.meter_hours}</strong>
                  </i>
                </div>
              </>
            )}
          </NavigatLinkToNewTab>
          {editObj.mr_type === 53 && (
            <NavigatLinkToNewTab func={() => window.open(`inspections/details/${editObj.inspection_id}`, '_blank')} title='Inspection Info'>
              <i>
                Meters at Inspection: <strong style={{ color: theme.palette.primary.main }}>{editObj.meter_at_inspection}</strong>
              </i>
            </NavigatLinkToNewTab>
          )}
          <div className='p-3 my-2 d-flex flex-row justify-content-between align-items-center bg-white' style={{ borderRadius: '4px', margin: '8px', cursor: 'pointer' }}>
            <div>
              <span className='form-acc-title acc-cont-title bg-white'>Work Order</span>
              {!_.isEmpty(linkedWO) && (
                <div>
                  <i>
                    <strong style={{ color: theme.palette.primary.main }}># {linkedWO.wo_number}</strong> - {linkedWO.title}
                  </i>
                </div>
              )}
            </div>
            <span>
              <IconButton aria-label='more' aria-controls='long-menu' aria-haspopup='true' onClick={e => setAnchorEl(e.currentTarget)} size='small'>
                <MoreVertIcon fontSize='small' />
              </IconButton>
              <Menu id='schedule-list-menu' anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                {_.isEmpty(linkedWO) && <MenuItem onClick={() => assignWorkOrder()}>Link Work Order</MenuItem>}
                {_.isEmpty(linkedWO) && <MenuItem onClick={() => createWO__()}>Create Work Order</MenuItem>}
                {!_.isEmpty(linkedWO) && <MenuItem onClick={() => setUnlinkModalOpen(true)}>Unlink Work Order</MenuItem>}
              </Menu>
            </span>
          </div>
          <div className={clsx(classes.paneHeader, classes.bottomBar)}>
            <Button variant='contained' color='default' className='nf-buttons' disableElevation onClick={() => closeForm()}>
              Cancel
            </Button>
            <Button variant='contained' color='primary' className='nf-buttons' onClick={validateForm} disableElevation disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
              {loading && <CircularProgress size={20} thickness={5} style={{ color: '#fff', marginLeft: '10px' }} />}
            </Button>
          </div>
        </div>
      </Drawer>
      <DialogPrompt title='Unlink Work Order' text='Are you sure you want to unlink the work order from the request ?' open={isUnlinkModelOpen} ctaText='Unlink' action={() => removeAction()} handleClose={() => setUnlinkModalOpen(false)} />
      {isAssignWOModalOpen && <AddWOModal setLinkedWO={setLinkedWO} assetID={editObj.asset_id} open={isAssignWOModalOpen} handleClose={() => setAssignWOModalOpen(false)} />}
    </>
  )
}

export default EditRequest
