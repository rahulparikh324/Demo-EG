import React, { useEffect, useState } from 'react'
import Button from '@material-ui/core/Button'
import AddOutlined from '@material-ui/icons/AddOutlined'
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined'
import EditOutlinedIcon from '@material-ui/icons/EditOutlined'

import { ActionButton } from 'components/common/buttons'

import { TableComponent } from 'components/common/table-components'

import { get, isEmpty } from 'lodash'
import { snakifyKeys } from 'helpers/formatters'
import SearchComponent from 'components/common/search'
import DialogPrompt from 'components/DialogPrompt'
import { contactCategoryOptions } from 'components/preventative-maintenance/common/utils'
import { Toast } from 'Snackbar/useToast'
import AddContact from './AddContact'
import jobScheduler from 'Services/jobScheduler'
import { FilterPopup } from 'components/common/others'

const ContactList = ({ vendorId, contactList, loading, reFetch }) => {
  const [searchString, setSearchString] = useState('')
  const [addContactOpen, setAddContactOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteContactOpen, setDeleteContactOpen] = useState(false)
  const [isEditOpen, setEditOpen] = useState(false)
  const [anchorObj, setAnchorObj] = useState({})
  const [rows, setRows] = useState([...contactList])
  const [categoryType, setCategoryType] = useState({})

  const columns = [
    { name: 'Name', accessor: 'name' },
    { name: 'Email', accessor: 'email' },
    { name: 'Phone Number', accessor: 'phoneNumber' },
    {
      name: 'Category',
      render: d => {
        const contactData = contactCategoryOptions.find(id => id.value === get(d, 'categoryId', null))
        return get(contactData, 'label', 'N/A')
      },
    },
    {
      name: 'Actions',
      render: d => (
        <div className='d-flex align-items-center'>
          <ActionButton action={e => handleAction(e, 'EDIT', d)} icon={<EditOutlinedIcon fontSize='small' />} tooltip='EDIT' />
          <ActionButton action={e => handleAction(e, 'DELETE', d)} icon={<DeleteOutlineOutlinedIcon fontSize='small' style={{ color: '#FF0000' }} />} tooltip='DELETE' />
        </div>
      ),
    },
  ]

  useEffect(() => {
    let filteredRows = [...contactList]
    if (!isEmpty(searchString)) {
      filteredRows = contactList.filter(x => (x.name !== null && x.name.toLowerCase().includes(searchString.toLowerCase())) || (x.email !== null && x.email.toLowerCase().includes(searchString.toLowerCase())) || (x.category !== null && x.category.toLowerCase().includes(searchString.toLowerCase())))
    } else {
      filteredRows = [...contactList]
    }

    if (categoryType && categoryType?.value != null) {
      filteredRows = filteredRows.filter(x => x.categoryId !== null && x.categoryId === categoryType?.value)
    }
    setRows(filteredRows)
  }, [searchString, categoryType, contactList])

  const handleAction = async (event, type, data) => {
    event.stopPropagation()
    setAnchorObj(data)
    if (type === 'DELETE') setDeleteContactOpen(true)
    if (type === 'EDIT') setEditOpen(true)
  }

  const handleContactView = data => {
    // setAnchorObj(data)
    // setEditOpen(true)
  }

  const deleteContact = async () => {
    const { contactId } = anchorObj
    try {
      setDeleteLoading(true)
      const res = await jobScheduler.createUpdateContact(snakifyKeys({ vendorId, contactId, isDeleted: true }))
      if (res.success > 0) {
        Toast.success(`Contact deleted successfully !`)
        reFetch()
      } else Toast.error(res.message || 'Something went wrong !')
      setDeleteLoading(false)
      setDeleteContactOpen(false)
    } catch (error) {
      setDeleteLoading(false)
      setDeleteContactOpen(false)
      Toast.error('Something went wrong !')
    }
  }

  return (
    <div style={{ background: '#fff', height: 'calc(100vh - 64px)', width: '100%', margin: '20px 0 20px 0px' }}>
      <div className='d-flex justify-content-between align-items-center' style={{ width: '100%', marginBottom: '20px' }}>
        <div className='d-flex align-items-center'>
          <Button size='small' onClick={() => setAddContactOpen(true)} startIcon={<AddOutlined />} variant='contained' color='primary' className='nf-buttons' disableElevation>
            Add Contact
          </Button>
          <div style={{ margin: '1px 0 0 7px' }}>
            <FilterPopup selected={categoryType} onChange={d => setCategoryType(d)} onClear={() => setCategoryType({})} placeholder='Category Type' options={contactCategoryOptions} />
          </div>
        </div>
        <SearchComponent placeholder='Search' searchString={searchString} setSearchString={setSearchString} />
      </div>
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100% - 115px)' }}>
        <TableComponent loading={loading} columns={columns} data={rows} />
      </div>
      {addContactOpen && <AddContact vendorId={vendorId} reFetch={reFetch} open={addContactOpen} onClose={() => setAddContactOpen(false)} />}
      {isEditOpen && <AddContact vendorId={vendorId} obj={anchorObj} isEdit reFetch={reFetch} open={isEditOpen} onClose={() => setEditOpen(false)} />}
      <DialogPrompt title='Delete Contact' text='Are you sure you want to delete the contact ?' open={deleteContactOpen} ctaText='Delete' actionLoader={deleteLoading} action={deleteContact} handleClose={() => setDeleteContactOpen(false)} />
    </div>
  )
}

export default ContactList
