import { useTheme } from '@material-ui/core/styles'
import Tooltip from '@material-ui/core/Tooltip'
import FolderOpenOutlinedIcon from '@material-ui/icons/FolderOpenOutlined'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import { Skeleton } from '@material-ui/lab'

import { Menu } from 'components/common/others'
import { fileExtensions } from 'components/preventative-maintenance/common/utils'

import { isEmpty, upperCase } from 'lodash'

export const FolderContainer = ({ isActive, title, onClick, hasMenu, menuOptions, data, isLocation = false }) => {
  const theme = useTheme()
  return (
    <div onClick={onClick} className='d-flex justify-content-between align-items-center px-2 py-1' style={{ height: '50px', borderBottom: '1px solid #EAEAEA', background: isActive ? (isLocation ? '#F5F5F5' : theme.palette.primary.main) : '#FFFFFF', cursor: 'pointer' }}>
      <div style={{ color: isActive ? (isLocation ? '#000' : '#FFFFFF') : '#000' }} className='d-flex'>
        <FolderOpenOutlinedIcon fontSize='small' style={{ marginRight: '6px' }} />
        <Tooltip title={title} placement='top'>
          <div>
            {isLocation ? title : title?.slice(0, 20)}
            {title?.length > 20 && <span>...</span>}
          </div>
        </Tooltip>
      </div>
      <div className='d-flex align-items-center'>
        <InfoOutlinedIcon fontSize='small' />
        {hasMenu && <Menu options={menuOptions} data={data} width={130} />}
      </div>
    </div>
  )
}

export const FileContainer = ({ filename, data, menuOptions, hasMenu, viewDetails }) => {
  const extension = filename.split('.').slice(-1).pop()
  let ext = ''
  Object.keys(fileExtensions).forEach(d => {
    if (fileExtensions[d].includes(extension)) ext = d
  })
  const icon = isEmpty(ext) ? 'other' : ext
  //
  // const download = () => {
  //   const link = document.createElement('a')
  //   link.href = url
  //   link.download = filename
  //   link.click()
  // }

  return (
    <div className='mt-2 d-flex align-items-center w-100 p-2 pointer' style={{ border: '1px solid #e0e0e0', borderRadius: '4px' }}>
      <div className='d-flex align-items-center w-100'>
        <img src={`/proassets/images/attachments-icons/${icon}.png`} alt='att-icon' width={32} height={32} />
        <div>
          <div className='ml-2'>{filename}</div>
          <div className='ml-2 text-bold '>{upperCase(icon)}</div>
        </div>
      </div>
      <InfoOutlinedIcon fontSize='small' onClick={viewDetails} />
      {hasMenu && <Menu options={menuOptions} data={data} width={130} />}
    </div>
  )
}

export const FileLoader = () => (
  <div>
    {[...Array(10)].map((x, index) => (
      <div key={index} className='border-bottom py-1 align-items-center' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }}>
        <Skeleton variant='text' animation='wave' height={60} />
        <Skeleton variant='text' animation='wave' height={60} />
        <Skeleton variant='text' animation='wave' height={60} />
        <Skeleton variant='text' animation='wave' height={60} />
      </div>
    ))}
  </div>
)
