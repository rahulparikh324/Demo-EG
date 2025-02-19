import React, { useState, useEffect } from 'react'
import Modal from '@material-ui/core/Modal'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Button from '@material-ui/core/Button'
import { MinimalAutoComplete } from '../Assets/components'
import { Toast } from '../../Snackbar/useToast'
import CircularProgress from '@material-ui/core/CircularProgress'
import getAssetsToAssign from 'Services/WorkOrder/get-assets-to-assign'
import assignAsset from '../../Services/WorkOrder/assignAsset.js'

function AssignAsset({ open, onClose, obj, afterSubmit }) {
  const [loading, setLoading] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [AssetOptions, setAssetOptions] = useState([])
  const [AssetsLoading, setAssetsLoading] = useState(false)
  useEffect(() => {
    ;(async () => {
      setAssetsLoading(true)
      try {
        const assetNameOpts = await getAssetsToAssign({ id: obj.form_id })
        // console.log(assetNameOpts)
        setAssetOptions(assetNameOpts.data.map(asset => ({ ...asset, label: asset.name, value: asset.asset_id })))
        setAssetsLoading(false)
      } catch (error) {
        setAssetsLoading(false)
        console.log(error)
        setAssetOptions([])
      }
    })()
  }, [])
  const submitData = async () => {
    setLoading(true)
    try {
      const data = {
        wOcategorytoTaskMapping_id: obj.wOcategorytoTaskMapping_id,
        parent_asset_id: selectedAsset.asset_id,
      }(data)
      const res = await assignAsset(data)
      if (res.success > 0) {
        Toast.success('Asset assigned successfully !')
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
        <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'EudoxusSans-Medium' }}>Assign Asset</div>
        <IconButton onClick={onClose} size='small'>
          <CloseIcon fontSize='small' />
        </IconButton>
      </div>
      <div className='px-3 py-2'>
        <div className='d-flex' style={{ width: '100%' }}>
          <MinimalAutoComplete placeholder='Search Asset ID/Name' value={selectedAsset} onChange={setSelectedAsset} options={AssetOptions} label='Select Asset' w={100} isClearable isLoading={AssetsLoading} />
        </div>
      </div>
      <div className='content-bar bottom-bar'>
        <Button variant='contained' color='default' className='nf-buttons mr-2' disableElevation onClick={onClose}>
          Cancel
        </Button>
        <Button variant='contained' color='primary' onClick={submitData} className='nf-buttons' disableElevation style={{ marginLeft: '10px' }} disabled={loading || selectedAsset === null}>
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

export default AssignAsset
