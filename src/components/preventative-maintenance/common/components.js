import { MinimalButton } from 'components/common/buttons'
import { Menu } from 'components/common/others'
import { ActionButton } from 'components/common/buttons'

import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined'
import AddIcon from '@material-ui/icons/Add'
import EditOutlinedIcon from '@material-ui/icons/EditOutlined'
import { useTheme } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'
import Tooltip from '@material-ui/core/Tooltip'
import BeenhereOutlinedIcon from '@material-ui/icons/BeenhereOutlined'

import { fileExtensions } from 'components/preventative-maintenance/common/utils'
import { isEmpty } from 'lodash'

export function CategoryItemName({ title, noAction = false, onAction, isActionDisabled, isEditIcon = false }) {
  return (
    <div style={{ height: '40px', borderBottom: '1px solid #EAEAEA' }} className='d-flex justify-content-between align-items-center px-2 py-1'>
      <div className='text-bold'>{title}</div>
      {!noAction && <MinimalButton disabled={isActionDisabled} text={!isEditIcon ? 'New' : 'Edit'} size='small' startIcon={!isEditIcon ? <AddIcon /> : <EditOutlinedIcon />} onClick={onAction} variant='contained' color='primary' baseClassName='nf-buttons' style={{ fontSize: '12px', padding: '3px' }} />}
    </div>
  )
}

export const ItemContainer = ({ isActive, title, count, onClick, hasMenu, menuOptions, data, hideCount = true, isLocation = false, isPMsTab = false, isDefaultIcon = false }) => {
  const theme = useTheme()
  const background = isLocation ? '' : isActive ? '#FFFFFF' : theme.palette.primary.main
  const color = isLocation ? '#000000' : isActive ? theme.palette.primary.main : '#FFFFFF'
  return (
    <div onClick={onClick} className='d-flex justify-content-between align-items-center px-2 py-1' style={{ height: '40px', borderBottom: '1px solid #EAEAEA', background: isActive ? (isLocation ? '#F5F5F5' : theme.palette.primary.main) : '#FFFFFF', cursor: 'pointer' }}>
      <div style={{ color: isActive ? (isLocation ? '#000' : '#FFFFFF') : '#000' }}>
        <Tooltip title={title} placement='top'>
          <div>
            {isLocation ? title : title?.slice(0, 20)}
            {title.length > 20 && <span>...</span>}
          </div>
        </Tooltip>
      </div>
      <div className='d-flex align-items-center'>
        {isDefaultIcon && data.isDefaultPmPlan && <BeenhereOutlinedIcon style={{ width: '20px', marginRight: '7px', color: isActive ? '#fff' : '#778899' }} />}
        {hideCount && (
          <div style={{ width: '20px', height: '20px', background, color, borderRadius: '20px' }} className='text-bold text-xs d-flex align-items-center justify-content-center'>
            {count}
          </div>
        )}
        {hasMenu && <Menu options={menuOptions} data={data} width={130} isPMsTab={isPMsTab} />}
      </div>
    </div>
  )
}

export const Section = ({ children, title, noAction, onAction, isActionDisabled, loading, style = {}, isEditIcon, isLocation = false }) => {
  return (
    <div style={{ minWidth: '250px', borderRight: '1px solid #EAEAEA', ...style }}>
      <CategoryItemName isActionDisabled={isActionDisabled} title={title} noAction={noAction} onAction={onAction} isEditIcon={isEditIcon} />
      {loading ? (
        <div style={{ minWidth: '250px', height: isLocation ? 'calc(100vh - 168px)' : 'calc(100vh - 105px)' }} className='d-flex justify-content-center align-items-center'>
          <CircularProgress size={19} thickness={5} style={{ marginRight: '6px', marginLeft: '6px' }} />
        </div>
      ) : (
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: isLocation ? 'calc(100vh - 168px)' : 'calc(100vh - 105px)' }}>
          {children}
        </div>
      )}
    </div>
  )
}

export const EmptySection = ({ message }) => {
  return (
    <div style={{ width: '99%', height: '99%', opacity: 0.5, textAlign: 'center' }} className='text-bold d-flex justify-content-center align-items-center'>
      {message}
    </div>
  )
}

export const AttachmentContainer = ({ url, filename, onDelete, readOnly }) => {
  const extension = filename.split('.').slice(-1).pop()
  let ext = ''
  Object.keys(fileExtensions).forEach(d => {
    if (fileExtensions[d].includes(extension)) ext = d
  })
  const icon = isEmpty(ext) ? 'other' : ext
  //
  const download = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
  }
  const deleteAtt = e => {
    e.stopPropagation()
    onDelete()
  }
  return (
    <div onClick={download} className='mt-2 d-flex align-items-center w-100 p-2 pointer' style={{ border: '1px solid #e0e0e0', borderRadius: '4px' }}>
      <div className='d-flex align-items-center w-100'>
        <img src={`/proassets/images/attachments-icons/${icon}.png`} alt='att-icon' width={32} height={32} />
        <div className='ml-2 text-bold'>{filename}</div>
      </div>
      {!readOnly && <ActionButton action={e => deleteAtt(e)} icon={<DeleteOutlineOutlinedIcon fontSize='small' />} tooltip='DELETE' style={{ color: '#FF0000' }} />}
    </div>
  )
}

export const PMPlan = ({ title, count, onClick, loading }) => {
  const theme = useTheme()
  const background = theme.palette.primary.main
  return (
    <div onClick={onClick} className='mb-2 d-flex justify-content-between align-items-center p-2 pointer' style={{ border: '1px solid #e0e0e0', borderRadius: '4px' }}>
      <div className='d-flex align-items-center'>
        <div className='mr-2' style={{ borderRadius: '4px', padding: '8px', background: '#EDEDED' }}>
          <svg xmlns='http://www.w3.org/2000/svg' height='24' viewBox='0 -960 960 960' width='24'>
            <path
              fill='#525252'
              d='M770.152-111.391 518.435-363.348l60.826-60.826 251.957 251.718-61.066 61.065Zm-582.674 0-60.587-61.065 290.718-290.718-108.435-108.435-23 23-41.609-41.369v82.369l-25.195 25.435L92.109-609.435l25.195-25.195h83.609l-45.609-45.848 133.152-132.674q17.479-17.478 38.196-23.718 20.718-6.239 45.435-6.239 24.717 0 45.554 8.859 20.837 8.859 38.316 26.098L347.761-700.196l48 47.761-24 24 105.435 105.674 123.195-123.196q-7.761-12.521-12.261-29.641-4.5-17.119-4.5-35.88 0-53.957 39.337-93.413 39.337-39.457 93.533-39.457 15.718 0 27.055 3.359 11.336 3.359 19.054 9.076l-85 85.239 73.087 73.087 85.239-85.239q5.956 8.717 9.576 21.174 3.62 12.456 3.62 28.174 0 54.195-39.337 93.532-39.337 39.337-93.294 39.337-17.761 0-30.641-2.5-12.881-2.5-23.641-7.261l-474.74 474.979Z'
            />
          </svg>
        </div>
        <Tooltip title={title} placement='top'>
          <div className='text-bold'>
            {title.slice(0, 30)}
            {title.length > 30 && <span>...</span>}
          </div>
        </Tooltip>
      </div>
      {loading ? (
        <CircularProgress size={19} thickness={5} style={{ marginRight: '6px', marginLeft: '6px' }} />
      ) : (
        <div style={{ width: '28px', height: '28px', background, color: '#fff', borderRadius: '4px' }} className='text-bold d-flex align-items-center justify-content-center'>
          {count}
        </div>
      )}
    </div>
  )
}

export const PmMetric = ({ title, count, onClick, loading, icon: Icon, color, w }) => (
  <div onClick={onClick} className='d-flex justify-content-start align-items-center p-2 pointer' style={{ border: '1px solid #e0e0e0', borderRadius: '4px', width: `${w}%`, minWidth: '154px' }}>
    <div className='mr-2 d-flex justify-content-center align-items-center' style={{ borderRadius: '4px', padding: '8px', background: `${color}35`, width: 54, height: 54 }}>
      <Icon fontSize='large' style={{ color }} />
    </div>
    <div>
      {loading ? (
        <CircularProgress size={19} thickness={5} style={{ marginRight: '6px', marginLeft: '6px' }} />
      ) : (
        <div style={{ fontSize: 24 }} className='text-bold'>
          {count}
        </div>
      )}
      <div className='text-bold'>{title}</div>
    </div>
  </div>
)
