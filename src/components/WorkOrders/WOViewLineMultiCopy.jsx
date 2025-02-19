import React, { useState, useEffect } from 'react'
import Modal from '@material-ui/core/Modal'
import CloseIcon from '@material-ui/icons/Close'
import IconButton from '@material-ui/core/IconButton'
import { MinimalInput } from '../Assets/components'
import _ from 'lodash'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import * as yup from 'yup'
import { validateSchema } from '../../helpers/schemaValidation'
import { Toast } from '../../Snackbar/useToast'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import { makeStyles } from '@material-ui/core/styles'
import multiCopyWOTask from '../../Services/WorkOrder/multiCopyWOTask'

const styles = {
  labelStyle: { fontSize: '14px' },
  inputStyle: { background: 'none', padding: '10px 16px', border: '1px solid #a1a1a1' },
}

const useStyles = makeStyles(theme => ({
  multiCopyCheckboxLabel: { fontSize: '14px' },
}))

function WOViewLineMultiCopy({ open, handleClose, afterSubmit, obj }) {
  const classes = useStyles()
  const [error, setError] = useState({})
  const [loading, setLoading] = useState(false)
  const [numberOfCopies, setNumberOfCopies] = useState(1)
  const [keepNameplate, setKeepNamePlate] = useState(false)
  const [keepVisualInspection, setKeepVisualInspection] = useState(false)
  const [keepParent, setKeepParent] = useState(false)
  const [keepTripTests, setKeepTripTests] = useState(false)
  const [keepFullData, setKeepFullData] = useState(false)
  // Validation
  const validateForm = async () => {
    const schema = yup.object().shape({
      number_of_copies: yup.number().required('Copies is required !').min(1, 'Copies cannot be Zero !'),
    })
    const payload = {
      number_of_copies: Number(numberOfCopies),
      keep_nameplate: keepNameplate,
      keep_visual_inspection: keepVisualInspection,
      keep_parent_assset: keepParent,
      keep_trip_test: keepTripTests,
      keep_all_data: keepFullData,
    }
    const isValid = await validateSchema(payload, schema)
    //console.log(payload, isValid)
    setError(isValid)
    if (isValid === true) submitData(payload)
  }
  // Submit
  const submitData = async data => {
    setLoading(true)
    try {
      const { number_of_copies, keep_nameplate, keep_visual_inspection, keep_parent_assset, keep_trip_test, keep_all_data } = data
      const request = {
        number_of_copies,
        keep_nameplate,
        keep_visual_inspection,
        keep_parent_assset,
        keep_trip_test,
        keep_all_data,
      }
      const payload = !_.isEmpty(obj) ? { ...request, wOcategorytoTaskMapping_id: obj.wOcategorytoTaskMappingId } : request
      const res = await multiCopyWOTask(payload)
      if (res.success > 0) Toast.success('Tasks are copied successfully!')
      else Toast.error(res.message)
    } catch (error) {
      //console.log(error)
      Toast.error('Something went wrong !')
    }
    setLoading(false)
    handleClose()
    afterSubmit()
  }

  const onNumberOfCopiesChange = value => {
    const re = /^[0-9\b]+$/
    // if (e.target.value === '' || re.test(e.target.value)) {
    if (value === '') {
      setNumberOfCopies(value)
    } else if (value > 99) {
      setNumberOfCopies(99)
    } else {
      setNumberOfCopies(value)
    }
  }

  const exceptThisSymbols = ['e', 'E', '+', '-', '.']

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby='simple-modal-title' aria-describedby='simple-modal-description'>
      <div style={modalStyle} className='add-task-modal'>
        <div className='d-flex flex-row justify-content-between align-items-center px-3 py-2' style={{ background: '#e0e0e080' }}>
          <div
            style={{
              fontSize: '15px',
              fontWeight: 800,
              fontFamily: 'EudoxusSans-Medium',
            }}
          >
            Multi - Copy Line
          </div>
          <IconButton onClick={handleClose} size='small'>
            <CloseIcon fontSize='small' />
          </IconButton>
        </div>
        <div className='px-3 py-2 mt-2'>
          <div className='d-flex' style={{ width: '100%' }}>
            <MinimalInput
              value={numberOfCopies}
              onChange={onNumberOfCopiesChange}
              onKeyDown={e => exceptThisSymbols.includes(e.key) && e.preventDefault()}
              error={error.number_of_copies}
              type='number'
              min={0}
              label='How Many Copies?'
              placeholder='0'
              w={100}
              labelStyles={styles.labelStyle}
              InputStyles={styles.inputStyle}
              onFocus={() => setError({ ...error, number_of_copies: null })}
            />
          </div>
          <div className='d-flex' style={{ width: '100%' }}>
            <FormControlLabel control={<Checkbox color='primary' checked={keepNameplate} onChange={e => setKeepNamePlate(e.target.checked)} />} label='Keep Nameplate' classes={{ label: classes.multiCopyCheckboxLabel }} />
            <FormControlLabel control={<Checkbox color='primary' checked={keepVisualInspection} onChange={e => setKeepVisualInspection(e.target.checked)} />} label='Keep Visual Inspection' classes={{ label: classes.multiCopyCheckboxLabel }} />
          </div>
          <div className='d-flex mt-n3' style={{ width: '100%' }}>
            <FormControlLabel control={<Checkbox color='primary' checked={keepParent} onChange={e => setKeepParent(e.target.checked)} />} label='Keep Parent' classes={{ label: classes.multiCopyCheckboxLabel }} />
            <FormControlLabel control={<Checkbox color='primary' checked={keepTripTests} onChange={e => setKeepTripTests(e.target.checked)} />} label='Keep Trip Tests' classes={{ label: classes.multiCopyCheckboxLabel }} />
          </div>
          <div className='d-flex mt-n3' style={{ width: '100%' }}>
            <FormControlLabel control={<Checkbox color='primary' checked={keepFullData} onChange={e => setKeepFullData(e.target.checked)} />} label='Keep All Data' classes={{ label: classes.multiCopyCheckboxLabel }} />
          </div>
        </div>
        <div className='content-bar bottom-bar'>
          <Button variant='contained' color='default' className='nf-buttons mr-2' disableElevation onClick={handleClose}>
            Cancel
          </Button>
          <Button variant='contained' color='primary' className='nf-buttons' disableElevation style={{ marginLeft: '10px' }} disabled={loading} onClick={validateForm}>
            {loading ? 'Processing...' : 'Go'}
            {loading && <CircularProgress size={20} thickness={5} style={{ color: '#fff', marginLeft: '10px' }} />}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

const modalStyle = {
  top: `50%`,
  left: `50%`,
  transform: `translate(-50%, -50%)`,
  position: 'absolute',
  background: '#fff',
  width: '30%',
}

export default WOViewLineMultiCopy
