import React, { useState } from 'react'

import useFetchData from 'hooks/fetch-data'
import { camelizeKeys } from 'helpers/formatters'
import { get, isEmpty, startCase } from 'lodash'

import CircularProgress from '@material-ui/core/CircularProgress'

import { MinimalInput, MinimalAutoComplete, MinimalTextArea, MinimalPhoneInput } from 'components/Assets/components'
import { MinimalButton } from 'components/common/buttons'

import assetClass from 'Services/FormIO/asset-class'

import { Toast } from 'Snackbar/useToast'

const CoreAttributes = ({ classId }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [nameplateInfo, setNameplateInfo] = useState([])
  const [nameplateInformation, setNameplateInformation] = useState({})
  const processData = data => {
    try {
      const parsed = JSON.parse(data)
      const arr = []
      Object.keys(parsed).forEach(d => {
        const value = !isEmpty(get(parsed[d], 'value', '')) ? get(parsed[d], 'value', '') : parsed[d]['type'] === 'select' ? null : ''
        arr.push({
          key: d,
          label: startCase(d),
          type: parsed[d]['type'],
          options: get(parsed[d], 'options', []),
          value,
        })
        parsed[d]['value'] = value
      })
      setNameplateInfo(arr)
      setNameplateInformation(parsed)
      return parsed
    } catch (error) {
      return {}
    }
  }
  const { data: nameplateData, reFetch, loading } = useFetchData({ fetch: assetClass.nameplateInfo.get, payload: { id: classId }, formatter: d => processData(camelizeKeys(get(d, 'data.formNameplateInfo', {}))) })

  const handleChange = (key, value) => {
    const data = { ...nameplateInformation }
    data[key]['value'] = value
    setNameplateInformation(data)
  }
  const handleSave = async () => {
    try {
      setIsLoading(true)
      const res = await assetClass.nameplateInfo.update({ inspectiontemplateAssetClassId: classId, formNameplateInfo: JSON.stringify(nameplateInformation) })
      if (res.success > 0) {
        Toast.success('Nameplate info updated successfully !')
        reFetch()
      } else Toast.error(res.message)
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      Toast.error('Something went wrong !')
    }
  }

  return (
    <div style={{ height: '100%' }}>
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100% - 32px)' }}>
        {loading ? (
          <CircularProgress size={32} thickness={5} style={{ position: 'absolute', top: '50%', left: '50%' }} />
        ) : isEmpty(nameplateInfo) ? (
          <div className='text-bold' style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
            Nameplate Information not found !
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px', marginTop: '16px' }}>
            {nameplateInfo.map(d => {
              if (d.type === 'select') {
                return (
                  <>
                    {/* <MinimalAutoComplete key={d.key} options={d.options} value={get(nameplateInformation, [d.key, 'value'], '')} onChange={value => handleChange(d.key, value)} label={d.label} placeholder={`Select ${d.label}`} isClearable baseStyles={{ marginRight: 0 }} /> */}
                    <MinimalInput
                      key={d}
                      value={get(nameplateInformation, [d.key, 'value'], '')}
                      onChange={value => {
                        if (d.key === 'size' && +value < 0) {
                          handleChange(d.key, 0)
                        } else {
                          handleChange(d.key, value)
                        }
                      }}
                      label={d.label}
                      placeholder={`Add ${d.label}`}
                      baseStyles={{ marginRight: 0 }}
                      type={d.label === 'Size' ? 'number' : ''}
                    />
                  </>
                )
              } else if (d.type === 'textarea') return <MinimalTextArea key={d.key} rows={3} value={get(nameplateInformation, [d.key, 'value'], '')} onChange={e => handleChange(d.key, e.target.value)} placeholder={`Add ${d.label}`} label={d.label} />
              else if (d.type === 'phoneNumber') return <MinimalPhoneInput key={d.key} value={get(nameplateInformation, [d.key, 'value'], '')} onChange={value => handleChange(d.key, value)} label={d.label} baseStyles={{ marginRight: 0 }} />
              else
                return (
                  <MinimalInput
                    key={d.key}
                    value={get(nameplateInformation, [d.key, 'value'], '')}
                    onChange={value => {
                      if (d.key === 'size' && +value < 0) {
                        handleChange(d.key, 0)
                      } else {
                        handleChange(d.key, value)
                      }
                    }}
                    label={d.label}
                    placeholder={`Add ${d.label}`}
                    baseStyles={{ marginRight: 0 }}
                    type={d.label === 'Size' ? 'number' : ''}
                  />
                )
            })}
          </div>
        )}
      </div>
      {!loading && (
        <div className='d-flex flex-row-reverse align-items-center'>
          <MinimalButton variant='contained' color='primary' text='Save Information' onClick={handleSave} disabled={isLoading || isEmpty(nameplateInfo)} loading={isLoading} loadingText='Saving...' />
        </div>
      )}
    </div>
  )
}

export default CoreAttributes
