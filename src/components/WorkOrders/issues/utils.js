import { get } from 'lodash'
import { typeOptions, statusChipOptions, getChip } from 'components/Issues/utlis'
import { StatusComponent } from 'components/common/others'
import { ActionButton } from 'components/common/buttons'
import enums from 'Constants/enums'

import CheckBoxOutlineBlankOutlinedIcon from '@material-ui/icons/CheckBoxOutlineBlankOutlined'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import WarningIcon from '@material-ui/icons/Warning'
import CloseIcon from '@material-ui/icons/Close'
import BuildIcon from '@material-ui/icons/Build'
import ErrorIcon from '@material-ui/icons/Error'
import WhatshotIcon from '@material-ui/icons/Whatshot'
import SettingsIcon from '@material-ui/icons/Settings'

export const formatIssues = d => {
  const main = get(d, 'mainIssueList', []) || []
  const temp = get(d, 'tempIssueList', []) || []
  main.forEach(d => {
    d.id = d.assetIssueId
    d.isTemp = false
  })
  // temp.forEach(d => {
  //   d.id = d.woLineIssueId
  //   d.isTemp = true
  // })
  return main
}

export const renderIssueTitle = d => d.issueTitle.split('_').join(' ')
export const renderIssueType = d => {
  const type = typeOptions.find(q => q.value === d.issueType)
  return <div className='py-1'>{get(type, 'label', 'NA')}</div>
}
export const renderIssueStatus = d => {
  const { color, label } = getChip(d.issueStatus, statusChipOptions)
  if (!color) return 'NA'
  return <StatusComponent color={color} label={label} size='small' />
}
export const RenderCheckBox = ({ data, selected, handleChange, accessor = 'id' }) => {
  if (selected?.includes(data[accessor])) return <ActionButton tooltip='DESELECT' icon={<CheckBoxIcon fontSize='small' />} action={e => (handleChange(data), e.stopPropagation())} />
  return <ActionButton tooltip='SELECT' icon={<CheckBoxOutlineBlankOutlinedIcon fontSize='small' />} action={e => (handleChange(data), e.stopPropagation())} />
}

export const IssueCard = ({ data, remove, readOnly }) => {
  const { color, label } = getChip(data.issueStatus, statusChipOptions)
  const type = typeOptions.find(q => q.value === data.issueType)
  const icons = {
    [enums.ISSUE.TYPE.REPAIR]: <BuildIcon fontSize='small' style={{ color }} />,
    [enums.ISSUE.TYPE.REPLACE]: <ErrorIcon fontSize='small' style={{ color }} />,
    [enums.ISSUE.TYPE.THERMAL_ANAMOLY]: <WhatshotIcon fontSize='small' style={{ color }} />,
    [enums.ISSUE.TYPE.COMPLIANCE]: <SettingsIcon fontSize='small' style={{ color }} />,
    [enums.ISSUE.TYPE.OTHER]: <WarningIcon fontSize='small' style={{ color }} />,
  }
  return (
    <div className='p-2 d-flex mb-2' style={{ border: '1px solid #A6A6A660', borderRadius: '4px', gap: '10px' }}>
      <div className='p-2 d-flex justify-content-center align-items-center' style={{ gridRow: '1/3', borderRadius: '4px', background: color ? `${color}40` : `#00000040`, width: '46px', height: '46px' }}>
        {icons[type.value]}
      </div>
      <div style={{ width: 'calc(100% - 50px)' }}>
        <div className='d-flex justify-content-between align-items-center'>
          <div className='text-bold'>{data.issueTitle.split('_').join(' ')}</div>
          {!readOnly && <ActionButton tooltip='REMOVE' icon={<CloseIcon fontSize='small' />} action={e => remove(data)} />}
        </div>
        <div className='d-flex align-items-center'>
          <div className='text-bold d-flex'>
            <span style={{ opacity: 0.6 }}>Status:</span>
            <span>{label || 'NA'}</span>
          </div>
          <div className='text-bold d-flex ml-2'>
            <span style={{ opacity: 0.6 }}>Type:</span>
            <span>{type.label}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
