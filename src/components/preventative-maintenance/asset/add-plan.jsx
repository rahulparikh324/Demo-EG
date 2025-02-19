import React, { useState, useEffect } from 'react'

import useFetchData from 'hooks/fetch-data'

import Drawer from '@material-ui/core/Drawer'
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined'

import { FormTitle } from 'components/Maintainance/components'
import { LoaderContainer, EmptyState } from 'components/common/others'
import { PMPlan } from 'components/preventative-maintenance/common/components'
import SearchComponent from 'components/common/search'

import { get, isEmpty } from 'lodash'

import preventativeMaintenance from 'Services/preventative-maintenance'
import { Toast } from 'Snackbar/useToast'

const AddPlan = ({ open, onClose, id, afterSubmit, assetId }) => {
  const [searchString, setSearchString] = useState('')
  const [loadingId, setLoadingId] = useState('')
  const [plans, setPlans] = useState('')
  const { loading, data } = useFetchData({ fetch: preventativeMaintenance.asset.getPlans, payload: { id }, formatter: d => get(d, 'data', []), defaultValue: [] })
  useEffect(() => {
    if (!isEmpty(data)) {
      const filteredPlans = data.filter(d => d.planName.toLowerCase().includes(searchString.toLowerCase()))
      setPlans(filteredPlans)
    }
  }, [data, searchString])
  const addPlanToAsset = async pmPlanId => {
    try {
      setLoadingId('')
      const res = await preventativeMaintenance.asset.addPlan({ assetId, pmPlanId })
      if (res.success > 0) Toast.success(`Plan Added Successfully !`)
      else Toast.error(res.message)
      setLoadingId('')
    } catch (error) {
      Toast.error(`Error adding plan. Please try again !`)
      setLoadingId('')
    }
    onClose()
    afterSubmit()
  }

  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title='Add New Plan' closeFunc={onClose} style={{ width: '100%', minWidth: '450px' }} />
      <div className='d-flex flex-row-reverse p-2'>
        <SearchComponent placeholder='Search Plans' setSearchString={setSearchString} />
      </div>
      <div className='table-responsive dashboardtblScroll p-2' id='style-1' style={{ width: '450px', height: 'calc(100vh - 110px)' }}>
        {loading ? (
          <LoaderContainer />
        ) : isEmpty(plans) ? (
          <EmptyState icon={<ErrorOutlineOutlinedIcon style={{ fontSize: '32px', color: '#666' }} />} text='No Plans found !' />
        ) : (
          plans.map(({ pmPlanId, planName, pmCount }) => <PMPlan loading={loadingId === pmPlanId} key={pmPlanId} title={planName} count={pmCount} onClick={() => addPlanToAsset(pmPlanId)} />)
        )}
      </div>
    </Drawer>
  )
}

export default AddPlan
