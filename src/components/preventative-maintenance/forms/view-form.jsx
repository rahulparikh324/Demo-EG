import React, { useState } from 'react'

import Drawer from '@material-ui/core/Drawer'
import RemoveIcon from '@material-ui/icons/Remove'
import { useTheme } from '@material-ui/core/styles'
import AddAPhotoOutlinedIcon from '@material-ui/icons/AddAPhotoOutlined'
import AddIcon from '@material-ui/icons/Add'
import Checkbox from '@material-ui/core/Checkbox'

import { FormTitle } from 'components/Maintainance/components'
import { Header } from 'components/preventative-maintenance/forms/components'
import { MinimalInput, MinimalTextArea, MinimalAutoComplete } from 'components/Assets/components'
import { MinimalButtonGroup, FloatingButton, MinimalButton } from 'components/common/buttons'
import { AssetImage } from 'components/WorkOrders/onboarding/utils'
import { FormSection } from 'components/common/others'
import { LabelVal } from 'components/common/others'

import { get, isArray, isEmpty, set } from 'lodash'
import { nanoid } from 'nanoid'
import getUserRole from 'helpers/getUserRole'
import useFetchData from 'hooks/fetch-data'
import equipments from 'Services/equipments'

const ViewForm = ({ open, onClose, data, isView, submisson, obj, onEdit, isEdit }) => {
  const theme = useTheme()
  const userRole = new getUserRole()
  const metaData = { planType: { label: 'De Energized', value: 'deEnergized' }, isEnhanced: false }
  const [submissionData, setSubmissionData] = useState(submisson || { metaData })
  const siteId = !isEmpty(sessionStorage.getItem('siteId')) ? sessionStorage.getItem('siteId') : localStorage.getItem('siteId')
  const payload = { pageSize: 0, pageIndex: 0, siteId: siteId, searchString: '', equipmentNumber: [], manufacturer: [], modelNumber: [], calibrationStatus: [] }
  const torqueDetailList = get(submissionData, 'torqueDetails', [])
  const { data: equipmentListOptions } = useFetchData({ fetch: equipments.getAllEquipmentList, payload, formatter: d => get(d, 'data.list', []), externalLoader: true, condition: torqueDetailList.length > 0 })
  const equipmentOptions = !isArray(equipmentListOptions) ? [] : [...equipmentListOptions.map(e => ({ label: e.equipmentNumber, value: e.equipmentNumber }))]
  const Photos = ({ photos = [], label }) => {
    return (
      <div>
        <div className='minimal-input-label disabled-label'>{label}</div>
        <div className='pt-1 mb-2 d-flex' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} id='style-1'>
          {isEmpty(photos) ? (
            <div className='text-bold p-3' style={{ width: '100%', textAlign: 'center', background: '#a6a6a6', opacity: '0.7', borderRadius: '4px' }}>
              No images present !
            </div>
          ) : (
            photos.map((d, index) => <AssetImage readOnly key={`asset-image-${d}-${index}`} url={d} randomValue />)
          )}
        </div>
      </div>
    )
  }
  const Container = ({ components, dataKey, container }) => {
    return (
      <>
        {components.map(d => {
          const key = `${dataKey}.${d.key}`
          const show = evaluateConditions(d.show, dataKey)
          const label = !isEmpty(d.dynamicLabel) ? get(container, d.dynamicLabel.split('.').slice(1).join('.'), '') : d.label
          const test = !isEmpty(get(submissionData, key, '')) ? get(submissionData, key, '') : {}
          if (d.type === 'selector' && show) return <MinimalButtonGroup key={key} value={get(test, 'value', '')} onChange={value => handleOnChange(key, value)} label={label} options={get(d, 'values', [])} w={100} baseStyles={{ marginRight: 0 }} disabled={isView} />
          if (d.type === 'textarea' && show) return <MinimalTextArea rows={3} key={key} value={get(submissionData, key, '')} onChange={e => handleOnChange(key, e.target.value)} label={label} placeholder={`Add ${d.label}`} baseStyles={{ marginRight: 0 }} disabled={isView} />
          if (d.type === 'select' && show) return <MinimalAutoComplete key={nanoid()} value={get(submissionData, key, '')} onChange={value => {}} label={label} options={get(d, 'values', [])} placeholder={`Select ${label}`} isClearable baseStyles={{ marginRight: 0 }} isDisabled={isView} />
          if (['beforePhoto', 'afterPhoto'].includes(d.key) && show) return <Photos label={label} key={key} dataKey={key} photos={get(submissionData, key, [])} />
          return ''
        })}
      </>
    )
  }
  const Footer = ({ components }) => {
    return (
      <>
        {components.map(d => {
          if (d.type === 'textarea') return <MinimalTextArea rows={3} key={nanoid()} value={get(submissionData, `footer.${d.key}`, '')} onChange={e => {}} label={d.label} placeholder={`Add ${d.label}`} baseStyles={{ marginRight: 0 }} disabled={isView} />
          if (d.type === 'select') return <MinimalAutoComplete key={nanoid()} value={get(submissionData, `footer.${d.key}`, '')} onChange={value => {}} label={d.label} options={get(d, 'values', [])} placeholder={`Select ${d.label}`} isClearable baseStyles={{ marginRight: 0 }} isDisabled={isView} />
          if (d.type === 'photos')
            return (
              <div key={nanoid()}>
                <div className={`minimal-input-label ${isView ? 'disabled-label' : ''}`}>{d.label}</div>
                <div className='p-0 mb-2 d-flex' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} id='style-1'>
                  {/* <input ref={uploadPhotosRef} type='file' style={{ display: 'none' }} onChange={addPhoto} /> */}
                  {/* <AssetImageUploadButton loading={false} disabled={isView} onClick={() => {}} /> */}
                  {/* {get(issue, 'issueImageList', []).map(d => !d.isDeleted && d.imageDurationTypeId === 1 && <AssetImage onRemove={() => removeImage(d)} key={`asset-image-${d.imageThumbnailFileName}`} url={d.imageThumbnailFileNameUrl} />)} */}
                </div>
              </div>
            )
          if (d.type === 'panel')
            return (
              <FormSection key={nanoid()} title={d.label} keepOpen>
                {get(d, 'components', []).map(s => {
                  if (s.type === 'grid') return <Grid key={nanoid()} rows={get(s, 'rows', [])} />
                  return ''
                })}
              </FormSection>
            )
          return ''
        })}
      </>
    )
  }
  const Grid = ({ rows }) => {
    const columns = [
      { label: 'Type', width: '40%' },
      { label: 'Caption', width: '40%' },
      { label: 'Photo', width: '12%' },
      { label: 'Action', width: '8%' },
    ]
    const gridRows = isEmpty(submissionData) ? rows : get(submissionData, `footer.additionalPhotos`, []).map(d => rows[0])
    return (
      <div style={{ border: '1px solid #a1a1a1', borderRadius: '4px', width: '100%' }}>
        <div className='d-flex align-items-center p-2 ' style={{ borderBottom: '1px solid #a1a1a1' }}>
          {columns.map(({ label, width }) => {
            if (!isEmpty(submissionData) && label === 'Action') return ''
            return (
              <div key={label} className='text-bold' style={{ width }}>
                {label}
              </div>
            )
          })}
        </div>
        {isEmpty(gridRows) ? (
          <div className='text-bold p-2 m-2' style={{ width: 'calc(100% - 16px)', textAlign: 'center', background: '#a6a6a6', opacity: '0.7', borderRadius: '4px' }}>
            No images present !
          </div>
        ) : (
          gridRows.map((row, index) => (
            <div className='d-flex  align-items-start pb-0 px-2 pt-2' key={index}>
              {!isEmpty(row) &&
                row.map(col => (
                  <React.Fragment key={nanoid()}>
                    {col.type === 'select' && <MinimalAutoComplete key={nanoid()} w={40} value={get(submissionData, `footer.additionalPhotos[${index}].type`, '')} onChange={value => {}} options={get(col, 'values', [])} placeholder={`Select ${col.label}`} isClearable isDisabled={isView} />}
                    {col.type === 'input' && <MinimalInput key={nanoid()} w={40} value={get(submissionData, `footer.additionalPhotos[${index}].caption`, '')} onChange={value => {}} placeholder={col.label} disabled={isView} baseStyles={{ marginRight: isEmpty(submissionData) ? 0 : '10px' }} />}
                    {col.type === 'photos' &&
                      (isEmpty(get(submissionData, `footer.additionalPhotos[${index}].photo`, '')) ? (
                        <FloatingButton disabled key={nanoid()} w={12} onClick={() => {}} icon={<AddAPhotoOutlinedIcon fontSize='small' />} style={{ background: theme.palette.primary.main, color: '#fff', width: '42px', height: '42px', marginLeft: '8px', borderRadius: '4px' }} />
                      ) : (
                        <AssetImage readOnly url={get(submissionData, `footer.additionalPhotos[${index}].photo`, '')} width='42px' randomValue />
                      ))}
                  </React.Fragment>
                ))}
              {isEmpty(submissionData) && <FloatingButton disabled key={nanoid()} onClick={() => {}} icon={<RemoveIcon fontSize='small' />} style={{ background: theme.palette.primary.main, color: '#fff', width: '42px', height: '42px', marginLeft: '8px', borderRadius: '4px' }} />}
            </div>
          ))
        )}
        {isEmpty(submissionData) && (
          <div className='p-2 m-2 text-bold' style={{ borderRadius: '4px', cursor: 'pointer', border: '1px dashed #a1a1a1', background: 'none', textAlign: 'center' }}>
            Add New
          </div>
        )}
      </div>
    )
  }
  const handleOnChange = (key, value) => {
    const data = structuredClone(submissionData)
    set(data, key, value)
    setSubmissionData(data)
  }
  //
  const HeaderContainer = ({ data }) => (
    <div style={{ padding: '16px', background: '#fff', borderRadius: '4px', marginBottom: '10px' }}>
      <Header title={data.title} subtitle={data.subTitle}>
        {/* {userRole.isManager() && ( */}
        <LabelVal label='Building' value={get(obj, 'building', 'N/A')} />
        <LabelVal label='Floor' value={get(obj, 'floor', 'N/A')} />
        <LabelVal label='Room' value={get(obj, 'room', 'N/A')} />
        <LabelVal label='Section' value={get(obj, 'section', 'N/A')} />
        {/* )} */}
        {get(data, 'components', []).map(s => {
          const key = `${data.type}.${s.key}`
          const value = get(submissionData, key, '')
          if (s.type === 'input') return <MinimalInput key={key} value={value} type={get(s, 'inputType', 'text')} label={s.label} placeholder={s.label} hasSuffix={!isEmpty(s.suffix)} suffix={s.suffix} disabled={isView} baseStyles={{ margin: 0 }} />
          if (s.type === 'textarea') return <MinimalTextArea rows={3} key={key} value={value} label={s.label} placeholder={`Add ${s.label}`} baseStyles={{ marginRight: 0 }} disabled={isView} />
          if (s.type === 'select') return <MinimalAutoComplete key={key} value={value} label={s.label} options={get(s, 'values', [])} placeholder={`Select ${s.label}`} isClearable baseStyles={{ marginRight: 0 }} isDisabled={isView} />
          else return ''
        })}
      </Header>
    </div>
  )
  const BodyContainer = ({ data }) => (
    <React.Fragment>
      {get(data, 'components', [])
        .filter(d => d.planType === get(submissionData, 'metaData.planType.value', '') || d.type === 'typeSelector')
        .map(s => {
          if (s.type === 'container') {
            if (s.isEnhanced && !get(submissionData, 'metaData.isEnhanced', false)) return ''
            return <IssueContainer issue={s} key={s.key} />
          }
          if (s.type === 'typeSelector') {
            const totalBodyContaintersLength = get(data, 'components', []).filter(d => get(d, 'type') === 'container').length
            const onlyEnhancedContainersLength = get(data, 'components', []).filter(d => get(d, 'type') === 'container' && get(d, 'isEnhanced') === true).length
            const isEnhancedChecked = onlyEnhancedContainersLength === totalBodyContaintersLength ? true : false
            return (
              <div key={`container-${s.key}`} style={{ padding: '16px', background: '#fff', borderRadius: '4px', marginBottom: '10px' }}>
                {get(s, 'components', []).map(d => {
                  const key = `${s.key}.${d.key}`
                  const test = !isEmpty(get(submissionData, key, '')) ? get(submissionData, key, '') : {}
                  if (d.type === 'selector') return <MinimalButtonGroup key={key} value={get(test, 'value', '')} label={d.label} options={get(d, 'values', [])} w={100} baseStyles={{ marginRight: 0 }} disabled />
                  if (d.type === 'checkbox')
                    return (
                      <div key={key} className='d-flex align-items-center mt-2'>
                        <Checkbox color='primary' size='small' checked={isEnhancedChecked || get(submissionData, key, false)} style={{ padding: 0 }} disabled />
                        <div className='text-bold ml-2' style={{ opacity: 0.75 }}>
                          {d.label}
                        </div>
                      </div>
                    )
                  return ''
                })}
              </div>
            )
          }
          return ''
        })}
    </React.Fragment>
  )
  const IssueContainer = ({ issue }) => (
    <div style={{ padding: '16px', background: '#fff', borderRadius: '4px', marginBottom: '10px' }}>
      <Container dataKey={issue.key} container={issue} components={get(data, 'container', [])} />
    </div>
  )
  const evaluateConditions = (conditions = [], key) => {
    if (isEmpty(conditions)) return true
    let results = []
    conditions.forEach(({ condition, value }) => {
      const fetched = get(submissionData, `${key}.${condition}`, '')
      results.push(fetched === value)
    })
    results = [...new Set([...results])]
    if (results.length !== 1) return false
    else return results[0]
  }
  const TorqueBodyContainer = ({ data: torqueBodyData }) => (
    <div key='torque-body-container' style={{ padding: '16px', background: '#fff', borderRadius: '4px', marginBottom: '10px' }}>
      <div className='d-flex align-items-center justify-content-between'>
        <div className='minimal-input-label text-sm'>{get(torqueBodyData, 'title', '')}</div>
        <MinimalButton size='small' startIcon={<AddIcon />} text={get(torqueBodyData, 'btnTitle', '')} variant='contained' color='primary' disabled />
      </div>
      {!isEmpty(torqueDetailList) &&
        torqueDetailList.map((d, index) => (
          <div key={d.id} className='torque-section mt-3'>
            <div className='d-flex justify-content-between p-2' style={{ borderBottom: '1px solid #dee2e6' }}>
              <div className='d-flex align-items-center'>
                <div style={{ fontWeight: 600 }}>Record No : </div>
                <div style={{ wordWrap: 'break-word', marginLeft: '4px' }}>{index + 1}</div>
              </div>
            </div>
            <div className='d-flex mt-2 ml-2'>
              <MinimalAutoComplete options={equipmentOptions} value={get(d, 'equipment', null)} placeholder='Select Torque Equipment' label='Torque Equipment' w={60} isDisabled={isView} />
              <MinimalInput value={get(d, 'noOfItems', '')} placeholder='Enter No. Of Items' label='No. Of Items' w={40} type='number' disabled={isView} />
            </div>
            <div className='d-flex ml-2'>
              <MinimalInput value={get(d, 'locationDescription', '')} placeholder='Description/ Location' label='Description/ Location' w={100} disabled={isView} />
            </div>
            <div className='d-flex ml-2'>
              <MinimalInput value={get(d, 'vendorSpecs', '')} placeholder='Vendor Specs' label='Vendor Specs' w={70} disabled={isView} />
              <MinimalAutoComplete options={get(torqueBodyData, 'measurementUnits', [])} value={get(d, 'vendorMeasureValue', null)} placeholder='Select Unit' label='Unit' w={30} isDisabled={isView} />
            </div>
            <div className='d-flex ml-2'>
              <MinimalInput value={get(d, 'netaSpecs', '')} placeholder='NETA Specs' label='NETA Specs' w={70} disabled={isView} />
              <MinimalAutoComplete options={get(torqueBodyData, 'measurementUnits', [])} value={get(d, 'netaMeasureValue', null)} placeholder='Select Unit' label='Unit' w={30} isDisabled={isView} />
            </div>
            <div className='d-flex ml-2'>
              <MinimalInput value={get(d, 'torqueSpacs', '')} placeholder='Torque Value' label='Torque Value' w={70} disabled={isView} />
              <MinimalAutoComplete options={get(torqueBodyData, 'measurementUnits', [])} value={get(d, 'torqueMeasureValue', null)} placeholder='Select Unit' label='Unit' w={30} isDisabled={isView} />
            </div>
            <div className='d-flex ml-2'>
              <MinimalTextArea value={get(d, 'note', '')} placeholder='Add Note...' label='Note' w={100} disabled={isView} />
            </div>
          </div>
        ))}
    </div>
  )
  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title='View Form' closeFunc={onClose} onEdit={onEdit} isEdit={isEdit} style={{ width: '100%', minWidth: '450px' }} />
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', background: '#efefef' }}>
        <div style={{ padding: '10px', width: '620px' }}>
          {get(data, 'components', []).map(d => {
            if (d.type === 'header') return <HeaderContainer data={d} key='header-container' />
            else if (d.type === 'footer')
              return (
                <div key={nanoid()} style={{ padding: '16px', background: '#fff', borderRadius: '4px', marginBottom: '10px' }}>
                  <Footer key={d.key} components={get(d, 'components', [])} />
                </div>
              )
            else if (d.type === 'body') return <BodyContainer data={d} key='body-container' />
            else if (d.type === 'torqueBody') return <TorqueBodyContainer data={get(data, 'components', []).find(d => d.type === 'torqueBody')} />
            else return ''
          })}
        </div>
      </div>
    </Drawer>
  )
}

export default ViewForm
