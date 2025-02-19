import React, { useState, useEffect } from 'react'

import useFetchData from 'hooks/fetch-data'
import { camelizeKeys, snakifyKeys } from 'helpers/formatters'
import { get, isEmpty } from 'lodash'

import getFormListToAdd from 'Services/FormIO/get-form-list-to-add'
import addFormToClass from 'Services/FormIO/add-form-to-class'

import Drawer from '@material-ui/core/Drawer'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import { FormTitle } from 'components/Maintainance/components'
import { TableComponent } from 'components/common/table-components'
import SearchComponent from 'components/common/search'
import { Toast } from 'Snackbar/useToast'

const AddForm = ({ open, onClose, classId, reFetch }) => {
  const [fetchingID, setFetchingID] = useState('')
  const [searchString, setSearchString] = useState('')
  const { loading, data } = useFetchData({ fetch: getFormListToAdd, payload: { id: classId }, formatter: d => camelizeKeys(d) })
  const [formList, setFormList] = useState(get(data, 'data', []))
  const assignForm = async data => {
    try {
      setFetchingID(data.formId)
      const res = await addFormToClass(snakifyKeys({ formId: data.formId, inspectiontemplateAssetClassId: classId }))
      if (res.success > 0) Toast.success('Form Added successfully !')
      else Toast.error(res.message)
      setFetchingID('')
      onClose()
      reFetch()
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
    }
  }
  const columns = [
    { name: 'Name', accessor: 'formName' },
    { name: 'Work Procedure', accessor: 'workProcedure' },
    {
      name: 'Actions',
      render: d => (
        <Button size='small' onClick={() => assignForm(d)} variant='contained' color='primary' className='nf-buttons ml-2' disableElevation style={{ fontSize: '10px' }} disabled={fetchingID === d.formId}>
          {fetchingID === d.formId ? 'Assigning...' : 'Assign'}
          {fetchingID === d.formId && <CircularProgress size={20} thickness={5} style={{ color: '#fff', marginLeft: '10px' }} />}
        </Button>
      ),
    },
  ]
  useEffect(() => {
    if (!isEmpty(data)) setFormList(get(data, 'data', []))
  }, [data])
  useEffect(() => {
    const list = get(data, 'data', [])
    if (isEmpty(searchString)) setFormList(list)
    else {
      const filteredList = list.filter(l => l.formName.toLowerCase().includes(searchString.toLowerCase()) || l.workProcedure.toLowerCase().includes(searchString.toLowerCase()))
      setFormList(filteredList)
    }
  }, [searchString])

  return (
    <Drawer anchor='right' open={open} onClose={onClose} style={{ width: '100%' }}>
      <FormTitle title='Inspection Forms' closeFunc={onClose} style={{ width: '100%' }} />
      <div style={{ padding: '10px', height: 'calc(100vh - 65px)', width: '640px' }}>
        <div className='d-flex flex-row-reverse mb-2'>
          <SearchComponent setSearchString={setSearchString} />
        </div>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: '94%' }}>
          <TableComponent loading={loading} columns={columns} data={formList} />
        </div>
      </div>
    </Drawer>
  )
}

export default AddForm
