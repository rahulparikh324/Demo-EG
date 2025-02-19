import React, { useState } from 'react'

import usePostData from 'hooks/post-data'

import Modal from '@material-ui/core/Modal'
import CloseIcon from '@material-ui/icons/Close'
import IconButton from '@material-ui/core/IconButton'

import * as yup from 'yup'
import { validateSchema } from 'helpers/schemaValidation'

import locationsUpdate from 'Services/locations'

import { MinimalButton } from 'components/common/buttons'
import { MinimalInput } from '../Assets/components'

import { get, isEmpty } from 'lodash'

const CreateFolder = ({ open, onClose, editSection, reFetch }) => {
  //   const [sectionInput, setSectionInput] = useState(isEmpty(editSection.sublevelcomponentAssetId) ? get(editSection, 'section', '') : get(editSection, 'formioSectionName', ''))
  const [error, setError] = useState({})

  //   const validateForm = async () => {
  //     const schema = yup.object().shape({
  //       sectionInput: yup.string().required('Section is required !'),
  //     })
  //     const isValid = await validateSchema({ sectionInput }, schema)
  //     setError(isValid)
  //     if (isValid === true) submitData()
  //   }

  //   const updatePostSuccess = () => {
  //     onClose()
  //     reFetch()
  //   }
  //   const { loading: isLoading, mutate: updateSection } = usePostData({ executer: locationsUpdate.updateLocationDetails, postSuccess: updatePostSuccess, message: { success: 'Section Update Successfully!', error: 'Something went wrong' } })
  //   const submitData = async () =>
  //     updateSection({
  //       formiobuildingId: 0,
  //       formiofloorId: 0,
  //       formioroomId: 0,
  //       formiosectionId: get(editSection, 'formiosectionId', 0),
  //       locationName: sectionInput,
  //       editingLocationFlag: 4,
  //     })
  return (
    <Modal open={open} onClose={onClose} aria-labelledby='simple-modal-title' aria-describedby='simple-modal-description'>
      <div style={modalStyle} className='add-task-modal'>
        <div className='d-flex flex-row justify-content-between align-items-center px-3 py-2' style={{ background: '#e0e0e080' }}>
          <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'EudoxusSans-Medium' }}>New Folder</div>
          <IconButton onClick={onClose} size='small'>
            <CloseIcon fontSize='small' />
          </IconButton>
        </div>
        <div className='px-3 py-2'>
          <MinimalInput placeholder='Enter Folder Name' label='Folder Name' value={{}} onChange={{}} error={error.sectionInput} onFocus={() => setError({ ...error, sectionInput: null })} />
        </div>
        <div className='content-bar bottom-bar mx-2'>
          <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
          <MinimalButton variant='contained' color='primary' text='Create' loadingText='Creating...' onClick={{}} disabled={false} loading={false} style={{ marginLeft: '10px' }} />
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
  width: '417px',
}
export default CreateFolder
