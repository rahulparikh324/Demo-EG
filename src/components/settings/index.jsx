import React, { useContext, useEffect } from 'react'
import useFetchData from 'hooks/fetch-data'

import { FlagItem, showIcons } from './utils'
import { get } from 'lodash'
import $ from 'jquery'

import settings from 'Services/settings'
import usePostData from 'hooks/post-data'
import { MainContext } from 'components/Main/provider'

const Settings = () => {
  const { setFeatureFlag } = useContext(MainContext)
  const { data, reFetch } = useFetchData({ fetch: settings.featuresFlagByCompany, formatter: d => get(d, 'data', {}) })

  useEffect(() => {
    const flagKeys = ['egalvanic_ai', 'estimator', 'allowed_to_update_formio', 'is_reactflow_required']

    const featureFlags = get(data, 'list', [])
      .filter(d => flagKeys.includes(d.featureName))
      .reduce((acc, curr) => {
        acc[curr.featureName] = curr.isRequired
        return acc
      }, {})

    setFeatureFlag({
      isEgalvanicAI: featureFlags.egalvanic_ai || false,
      isUpdateFormIO: featureFlags.allowed_to_update_formio || false,
      isEstimator: featureFlags.estimator || false,
      isRequiredMaintenanceCommandCenter: featureFlags.is_required_maintenance_command_center || false,
      isReactFlowSingleLine: featureFlags.is_reactflow_required || true,
    })
  }, [data])

  const handlePosrSuccess = () => reFetch()

  const { loading, mutate: updateFlag } = usePostData({ executer: settings.updateFlagForCompany, postSuccess: handlePosrSuccess, message: { success: '', error: '' }, hideMessage: true })
  const handleFlagToggle = async d => updateFlag({ companyFeatureId: d.companyFeatureId, isRequired: !d.isRequired })

  loading ? $('#pageLoading').show() : $('#pageLoading').hide()

  const handleTitle = data => {
    const title = data
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase())
    return title
  }
  return (
    <div style={{ height: 'calc(100vh - 128px)', padding: '20px', background: '#fff' }}>
      <h4 className='text-bold'>Feature Flags</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }} className='mt-4'>
        {get(data, 'list', []).map(d => (
          <FlagItem key={d.company_feature_id} title={handleTitle(d.featureName)} descriptions={d.featureDescription} isCheck={d.isRequired} icon={showIcons(d.featureName)} style={{ border: '1px solid rgb(225, 228, 234)', borderRadius: '7px' }} onChange={() => handleFlagToggle(d)} />
        ))}
      </div>
    </div>
  )
}

export default Settings
