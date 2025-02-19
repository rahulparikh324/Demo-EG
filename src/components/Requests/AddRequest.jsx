import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import { FormTitle } from '../Maintainance/components'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import _ from 'lodash'
import '../Maintainance/maintainance.css'
import clsx from 'clsx'
import { PriorityControl } from './components'
import addRequest from '../../Services/Requests/addRequest'
import { Toast } from '../../Snackbar/useToast'
import { useDispatch } from 'react-redux'
import { changeMROpenCount } from '../../Actions/helpers.action'
import { MinimalAutoComplete, MinimalInput, MinimalTextArea } from '../Assets/components'
import * as yup from 'yup'
import { validateSchema } from '../../helpers/schemaValidation'
import getAllAssetForTree from '../../Services/Asset/getAllAssetTree'

const useStyles = makeStyles(theme => ({
  containerDiv: { display: 'flex', justifyContent: 'space-between', flexDirection: 'column', height: '100%', width: '450px', background: '#efefef' },
  paneHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #A6A6A6', padding: '12px' },
  bottomBar: { borderTop: '1px solid #A6A6A6', borderBottom: 'none', background: '#fff' },
}))
const styles = {
  labelStyle: { fontWeight: 800 },
  inputStyle: { background: 'none', padding: '10px 16px', border: '1px solid #a1a1a1' },
  labelError: { color: 'red', fontWeight: 800 },
  inputError: { background: '#ff000021', padding: '10px 16px', border: '1px solid red', color: 'red', marginBottom: '-5px' },
}
function AddRequest({ open, onClose, afterSubmit }) {
  const classes = useStyles()
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [priority, setPriority] = useState(45)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [pageIndex, setPageIndex] = useState(1)
  const [searchString, setSearchString] = useState('')
  const [AssetOptions, setAssetOptions] = useState([])
  const [AssetsLoading, setAssetsLoading] = useState(false)
  const [assetType, setAssetType] = useState('')
  const [assetOpts, setAssetOpts] = useState([])
  const dispatch = useDispatch()
  let typingTimer = null
  //data loading
  useEffect(() => {
    ;(async () => {
      setAssetsLoading(true)
      try {
        const assetNameOpts = await getAllAssetForTree()
        setAssetOptions(assetNameOpts.data.map(asset => ({ ...asset, label: asset.name, value: asset.internal_asset_id })))
        setAssetOpts(assetNameOpts.data.map(asset => ({ ...asset, label: asset.name, value: asset.internal_asset_id })))
      } catch (error) {
        console.log(error)
        setAssetOptions([])
      }
      setAssetsLoading(false)
    })()
    return () => clearTimeout(typingTimer)
  }, [])
  //form functions
  const closeForm = () => {
    setTitle('')
    setDesc('')
    setPriority(45)
    setAssetType('')
    setErrors({})
    onClose(false)
  }
  const validateForm = async () => {
    const schema = yup.object().shape({
      title: yup.string().required('Title is required !').max(100, 'Title can not be more than 100 characters !'),
      desc: yup.string().required('Description is required !'),
      asset: yup.string().required('Asset is required !'),
    })
    const payload = { title, desc, asset: assetType.asset_id }
    const isValid = await validateSchema(payload, schema)
    setErrors(isValid)
    if (isValid === true) createRequestBody()
  }
  const onFocus = key => setErrors({ ...errors, [key]: null })
  const createRequestBody = async () => {
    const req = {
      title,
      description: desc,
      asset_id: assetType.asset_id,
      priority,
    }
    setLoading(true)
    submitData(req)
  }
  const submitData = async data => {
    try {
      const res = await addRequest(data)
      if (res.success > 0) Toast.success('Request created successfully !')
      else Toast.error(res.message)
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
    }
    setLoading(false)
    closeForm()
    dispatch(changeMROpenCount())
    afterSubmit()
  }
  //
  return (
    <>
      <Drawer anchor='right' open={open} onClose={() => closeForm()}>
        <FormTitle title='Create New Request' closeFunc={() => closeForm()} />
        <div className={classes.containerDiv}>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px', margin: '10px' }}>
            <MinimalInput value={title} onChange={setTitle} error={errors.title} label='Title' placeholder='Add Title' w={100} labelStyles={styles.labelStyle} InputStyles={styles.inputStyle} onFocus={e => onFocus('title')} />
            <MinimalTextArea onFocus={e => onFocus('desc')} rows={3} value={desc} error={errors.desc} onChange={e => setDesc(e.target.value)} placeholder='Add Description ..' label='Description' w={100} labelStyles={errors.desc ? styles.labelError : styles.labelStyle} InputStyles={errors.desc ? styles.inputError : styles.inputStyle} />
            <PriorityControl value={priority} onChange={setPriority} />
            <MinimalAutoComplete
              onFocus={e => onFocus('asset')}
              placeholder='Search Asset ID/Name'
              value={assetType}
              onChange={setAssetType}
              options={assetOpts}
              label='Select Asset'
              w={100}
              isClearable
              isLoading={AssetsLoading}
              labelStyles={{ fontWeight: 800 }}
              inputStyles={{ background: 'none', padding: '2px 6px', border: '1px solid #a1a1a1' }}
              errorStyles={{ background: '#ff000021', border: '1px solid red', color: 'red' }}
              error={errors.asset}
            />
          </div>
          <div className={clsx(classes.paneHeader, classes.bottomBar)}>
            <Button variant='contained' color='default' className='nf-buttons' disableElevation onClick={() => closeForm()}>
              Cancel
            </Button>
            <Button variant='contained' color='primary' className='nf-buttons' onClick={validateForm} disableElevation disabled={loading}>
              {loading ? 'Creating Request...' : 'Create Request'}
              {loading && <CircularProgress size={20} thickness={5} style={{ color: '#fff', marginLeft: '10px' }} />}
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  )
}

export default AddRequest
