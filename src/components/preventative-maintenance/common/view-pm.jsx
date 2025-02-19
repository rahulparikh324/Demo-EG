import React from 'react'

import Drawer from '@material-ui/core/Drawer'

import { FormAccordian, FormTitle } from 'components/Maintainance/components'
import { typeOptions, conditionTableColumns, timePeriodObj } from 'components/preventative-maintenance/common/utils'
import { LabelVal } from 'components/common/others'
import { AttachmentContainer } from 'components/preventative-maintenance/common/components'

import { get, orderBy } from 'lodash'
import { getFormatedDate } from 'helpers/getDateTime'

const ViewPM = ({ open, onClose, obj, isAssetPM }) => {
  const type = typeOptions.find(x => x.value === obj.pmTriggerType)
  const conditionsKey = isAssetPM ? 'assetPmTriggerConditionMapping' : 'pmTriggerConditionMappingResponseModel'
  const conditions = orderBy(get(obj, [conditionsKey], []), z => z.conditionTypeId)
  const attachmentsKey = isAssetPM ? 'assetPmAttachments' : 'pmAttachments'
  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title='View PM' closeFunc={onClose} style={{ width: '100%', minWidth: '450px' }} />
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ width: '450px', height: 'calc(100vh - 65px)', background: '#efefef' }}>
        <div style={{ padding: '10px' }}>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
            <LabelVal label='PM Title' value={get(obj, 'title', '')} inline />
            <LabelVal label='PM Description' value={get(obj, 'description', '')} />
            <LabelVal label='Estimated Time (In Minutes)' value={get(obj, 'estimationTime', '')} inline />
          </div>
        </div>
        <div style={{ padding: '0 10px' }}>
          <FormAccordian title='Schedule Triggers' style={{ borderRadius: '4px', background: '#fff' }} bg keepOpen>
            <div style={{ padding: '16px' }}>
              <div className='d-flex align-items-center'>
                {isAssetPM && <LabelVal w={65} label='Starting / Last Completed At' value={getFormatedDate(obj.datetimeStartingAt)} />}
                <LabelVal label='Type' value={get(type, 'label', '')} />
              </div>
              <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', width: '100%', marginTop: '15px' }}>
                <div className='d-flex align-items-center p-2 ' style={{ borderBottom: '1px solid #e0e0e0' }}>
                  {conditionTableColumns.slice(0, 2).map(({ label, width }) => (
                    <div key={label} className='text-bold' style={{ width }}>
                      {label}
                    </div>
                  ))}
                </div>
                {conditions.map((x, index) => (
                  <div key={x.pmTriggerConditionMappingId || x.assetPmTriggerConditionMappingId} className='d-flex align-items-center p-2 '>
                    <div className='d-flex justify-content-center align-items-center text-bold mr-2' style={{ width: '40px', height: '40px', borderRadius: '4px', color: obj.activeConditionTypeId === x.conditionTypeId ? '#fff' : '#000', background: obj.activeConditionTypeId === x.conditionTypeId ? '#37D482' : '#e0e0e0', textAlign: 'center' }}>
                      {index + 1}
                    </div>
                    <div className='ml-4'>
                      {x.datetimeRepeatesEvery} {timePeriodObj[x.datetimeRepeatTimePeriodType]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FormAccordian>
        </div>
        <div style={{ padding: '0 10px' }}>
          <FormAccordian title='Attachments' style={{ borderRadius: '4px', marginTop: '8px', background: '#fff' }} bg>
            <div className='p-3 mb-2'>
              {get(obj, [attachmentsKey], []).map(d => (
                <AttachmentContainer readOnly key={d.filename} url={d.fileUrl} filename={d.userUploadedName} />
              ))}
            </div>
          </FormAccordian>
        </div>
      </div>
    </Drawer>
  )
}
export default ViewPM
