import Skeleton from '@material-ui/lab/Skeleton'
import NotificationsNoneOutlinedIcon from '@material-ui/icons/NotificationsNoneOutlined'
import PostAddOutlinedIcon from '@material-ui/icons/PostAddOutlined'
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined'
import CheckCircleOutlineOutlinedIcon from '@material-ui/icons/CheckCircleOutlineOutlined'
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined'

import enums from 'Constants/enums'

export const NotificationLoader = ({ rows = 0 }) => {
  return (
    <>
      {[...Array(rows)].map((x, index) => (
        <div key={index} className='p-1 mb-2 d-flex'>
          {/* <Skeleton variant='circle' animation='wave' width={30} height={30} style={{ borderRadius: '15px', marginTop: '5px' }} /> */}
          <div>
            <Skeleton variant='text' animation='wave' width={'28vw'} height={35} style={{ marginLeft: '14px' }} />
            <Skeleton variant='text' animation='wave' width={'28vw'} height={25} style={{ marginLeft: '14px' }} />
          </div>
        </div>
      ))}
    </>
  )
}

export const NotificationCount = ({ count, onClick, isNotificationOpen }) => {
  return (
    <div style={{ position: 'relative', cursor: 'pointer', backgroundColor: isNotificationOpen && '#fff', borderRadius: '16px', padding: '4px' }} onClick={onClick}>
      <NotificationsNoneOutlinedIcon size='medium' style={{ color: isNotificationOpen ? '#778899' : '#fff' }} />
      {count > 0 && (
        <span className='d-flex align-items-center justify-content-center text-bold' style={{ backgroundColor: '#EDEFF1', color: '#778899', width: '20px', height: '20px', borderRadius: '50%', fontSize: '10px', position: 'absolute', bottom: '19px', left: isNotificationOpen ? '24px' : '18px', zIndex: 5 }}>
          {count > 100 ? '99+' : count}
        </span>
      )}
    </div>
  )
}

export const NotificationIcons = ({ type }) => {
  const iconMapping = {
    [enums.NOTIFICATION_TYPE.WORKORDER_ASSIGNED_TO_TECHNICIAN]: <PostAddOutlinedIcon size='small' />,
    [enums.NOTIFICATION_TYPE.SITE_ASSIGNED_TO_USER]: <PostAddOutlinedIcon size='small' />,
    [enums.NOTIFICATION_TYPE.ASSIGNED_WORKORDER_ISDUE]: <PostAddOutlinedIcon size='small' />,
    [enums.NOTIFICATION_TYPE.ALL_WOLINES_COMPLETED_OR_READYFORREVIEW_OF_WO]: <CheckCircleOutlineOutlinedIcon size='small' />,
    [enums.NOTIFICATION_TYPE.WORKORDER_IS_COMPLETED_WITH_ISSUE_CREATED]: <CheckCircleOutlineOutlinedIcon size='small' />,
    [enums.NOTIFICATION_TYPE.WORKORDER_ISOVERDUE]: <ErrorOutlineOutlinedIcon size='small' />,
  }

  // Default case for unknown notification types
  const defaultIcon = <DescriptionOutlinedIcon size='small' />

  return iconMapping[type] || defaultIcon
}
