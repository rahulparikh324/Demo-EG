import React, { useState, useEffect } from 'react'
import Drawer from '@material-ui/core/Drawer'
import Checkbox from '@material-ui/core/Checkbox'

import { FormTitle } from 'components/Maintainance/components'
import { MinimalInput } from 'components/Assets/components'
import { MinimalButton } from 'components/common/buttons'
import preventativeMaintenance from 'Services/preventative-maintenance'

import { snakifyKeys } from 'helpers/formatters'

import { isEmpty } from 'lodash'

import { Toast } from 'Snackbar/useToast'

const NewPlan = ({ open, onClose, afterSubmit, pmCategoryId, isNew, obj }) => {
  //
  const [planName, setPlanName] = useState('')
  const [PlanNameError, setPlanNameError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDefaultPmPlan, setisDefaultPmPlan] = useState(false)
  //
  const buttonText = isNew ? 'Add Plan' : 'Rename'
  const loadingText = isNew ? 'Adding...' : 'Renaming...'
  //
  useEffect(() => {
    if (!isNew) {
      setPlanName(obj.planName)
      setisDefaultPmPlan(obj.isDefaultPmPlan)
    }
  }, [obj, isNew])

  const validate = () => {
    const regex = /[^a-zA-Z0-9-]/
    if (planName.trim().length > 49) return setPlanNameError({ error: true, msg: 'Plan Name cannot contain more than 49 characters' })
    if (regex.test(planName)) return setPlanNameError({ error: true, msg: '* No special characters except ‘-’' })
    addPlan()
  }
  const addPlan = async () => {
    try {
      setIsLoading(true)
      const payload = { pmCategoryId, planName, isDefaultPmPlan }
      if (!isNew) payload.pmPlanId = obj.pmPlanId
      const res = await preventativeMaintenance.plans.addUpdate(snakifyKeys(payload))
      if (res.success > 0) Toast.success(`Plan ${isNew ? 'Added' : 'Renamed'} Successfully !`)
      else Toast.error(res.message)
      setIsLoading(false)
    } catch (error) {
      Toast.error(`Error ${isNew ? 'adding' : 'renaming'} plan. Please try again !`)
      setIsLoading(false)
    }
    onClose()
    afterSubmit()
  }
  //
  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title={isNew ? 'Add New Plan' : 'Edit Plan'} style={{ width: '100%', minWidth: '450px' }} closeFunc={onClose} />
      <div style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', background: '#fff', padding: '16px' }}>
        <MinimalInput value={planName} onChange={setPlanName} label='Plan Name' placeholder='Add Plan Name' baseStyles={{ margin: 0 }} error={PlanNameError} onFocus={() => setPlanNameError(null)} />
        <div className='d-flex align-items-center mt-2'>
          <Checkbox color='primary' size='small' checked={isDefaultPmPlan} style={{ padding: 0 }} onChange={e => setisDefaultPmPlan(e.target.checked)} />
          <div className='text-xs text-bold ml-2'>Mark As Default</div>
        </div>
      </div>
      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A6', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
        <MinimalButton variant='contained' color='primary' text={buttonText} onClick={validate} disabled={isLoading || isEmpty(planName)} loading={isLoading} loadingText={loadingText} />
      </div>
    </Drawer>
  )
}

export default NewPlan
