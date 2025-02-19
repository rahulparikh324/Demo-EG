import React, { useEffect, useRef, useState, useContext } from 'react'
import useFetchData from 'hooks/fetch-data'
import usePostData from 'hooks/post-data'

import Drawer from '@material-ui/core/Drawer'
import { makeStyles } from '@material-ui/styles'

import { FormTitle } from 'components/Maintainance/components'

import notification from 'Services/notification'
import { workOrderTypesPath } from 'components/WorkOrders/utils'
import { history } from 'helpers/history'

import { get, isEmpty } from 'lodash'
import { NotificationLoader, NotificationIcons } from './utils'
import enums from 'Constants/enums'
import moment from 'moment-timezone'
import { MainContext } from 'components/Main/provider'

const useStyles = makeStyles(() => ({
  drawerPaper: {
    marginTop: '54px',
    width: '30vw',
    height: 'calc(100vh - 205px)',
    borderRadius: '16px',
    marginRight: '200px',
  },
}))

const Notification = ({ open, onClose }) => {
  const classes = useStyles()
  const [notificationData, setnotificationData] = useState([])
  const [pageIndesx, setPageIndesx] = useState(20)
  const scrollableContainerRef = useRef(null)
  const previousScrollTop = useRef(0)

  const { notificationsCount, setNotificationsCount } = useContext(MainContext)

  const handleCountFormater = data => {
    setNotificationsCount(data)
    return data
  }
  // notificaton Api Integration
  const { reFetch: countReFetch } = useFetchData({ fetch: notification.count, formatter: d => handleCountFormater(get(d, 'data', 0)) })

  const handlenotificationFormatter = data => {
    setnotificationData(get(data, 'list', []))
    countReFetch()
    return data
  }

  const { initialLoading, data, reFetch } = useFetchData({ fetch: notification.get, payload: { list: pageIndesx, pageIndex: 1 }, formatter: d => handlenotificationFormatter(get(d, 'data', {})) })

  const notificationStatusPostSuccess = () => {
    reFetch()
    setNotificationsCount(notificationsCount - 1)
  }

  const { mutate: updateNotificationStatus } = usePostData({ executer: notification.updateNotificationStatus, postSuccess: notificationStatusPostSuccess, message: { error: 'Something went wrong !' }, hideMessage: true })
  const handleUpdateNotificationStatus = notificationId => updateNotificationStatus({ notificationId: notificationId, status: enums.NOTIFICATION.READ })

  const markAllReadPostSuccess = () => {
    reFetch()
    countReFetch()
  }
  const { loading, mutate: markAllRead } = usePostData({ executer: notification.markAllRead, postSuccess: markAllReadPostSuccess, message: { success: 'Read All Successfully!', error: 'Something went wrong !' } })
  const handleMarkAllRead = () => markAllRead()

  const handleTimeConverter = sendDate => {
    const currentDate = moment.utc() // Get current date and time in UTC
    const pastDate = moment.utc(sendDate) // Convert sendDate to UTC timezone
    const timeDifference = currentDate.diff(pastDate)

    const seconds = Math.round(moment.duration(timeDifference).asSeconds())
    const minutes = Math.round(moment.duration(timeDifference).asMinutes())
    const hours = Math.round(moment.duration(timeDifference).asHours())
    const days = Math.round(moment.duration(timeDifference).asDays())
    const months = Math.round(moment.duration(timeDifference).asMonths())
    const years = Math.round(moment.duration(timeDifference).asYears())

    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? 's' : ''} ago`
    } else if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    } else if (days < 30) {
      return `${days} day${days !== 1 ? 's' : ''} ago`
    } else if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''} ago`
    } else {
      return `${years} year${years !== 1 ? 's' : ''} ago`
    }
  }

  const handleOpenWODetails = data => {
    history.replace('')
    if (data.notificationType !== enums.NOTIFICATION_TYPE.SITE_ASSIGNED_TO_USER) {
      history.push({ pathname: `${workOrderTypesPath[data.woType]['path']}/${data.refId}` })
    }
  }

  const handleLoadMore = () => {
    if (scrollableContainerRef.current) {
      previousScrollTop.current = scrollableContainerRef.current.scrollTop
    }
    setPageIndesx(pageIndesx + 20)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollableContainerRef.current) {
        scrollableContainerRef.current.scrollTop = previousScrollTop.current
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [data])

  return (
    <Drawer anchor='right' open={open} onClose={onClose} PaperProps={{ className: classes.drawerPaper }} ModalProps={{ BackdropProps: { style: { backgroundColor: 'transparent' } } }}>
      <FormTitle title='Notifications' style={{ width: '30vw', height: '48px', backgroundColor: '#F5F5F5', color: '#000', padding: '14px' }} closeFunc={onClose} isBlackIcon />
      <div ref={scrollableContainerRef} className='table-responsive dashboardtblScroll' id='style-1' style={{ height: '100vh', background: '', fontSize: '12px' }}>
        <div className='d-flex justify-content-between mb-1' style={{ border: '1px solid #E5E7EB', padding: '8px 10px' }}>
          <div className='text-bold'>Latest</div>
          {!isEmpty(data.list) && !get(data, 'list', []).every(val => val.notificationStatus === enums.NOTIFICATION.READ) && (
            <div className='text-bold' style={{ color: '#778898', cursor: 'pointer' }} onClick={handleMarkAllRead}>
              Mark as all read
            </div>
          )}
        </div>
        {/* <div style={{ padding: '10px' }}> */}
        {initialLoading || loading ? (
          <NotificationLoader rows={8} />
        ) : isEmpty(data.list) ? (
          <div className='d-flex justify-content-center align-items-center ml-3' style={{ height: 'calc(100vh - 500px)' }}>
            No Notifications Found !
          </div>
        ) : (
          get(data, 'list', []).map(d => {
            return (
              <>
                <div className='p-2 px-3' key={d.notificationId} style={{ background: '#fff', cursor: 'pointer' }} onClick={() => (handleUpdateNotificationStatus(d.notificationId), handleOpenWODetails(d))}>
                  <div className='d-flex'>
                    <div style={{ width: '8%' }}>
                      <NotificationIcons type={d.notificationType} />
                    </div>
                    <div style={{ width: '91%' }}>
                      <div className='text-bold'>{d.heading}</div>
                      <div>{d.message}</div>
                    </div>
                    {d.notificationStatus === enums.NOTIFICATION.NEW && <div style={{ height: '10px', width: '10px', backgroundColor: '#778898', borderRadius: '5px' }}></div>}
                  </div>
                  <div className='d-flex flex-row-reverse'>{handleTimeConverter(d.sendDate)}</div>
                </div>
                <div style={{ borderBottom: '1px solid #fafafb', width: '90%', margin: '0 auto' }}></div>
              </>
            )
          })
        )}
        {/* </div> */}
      </div>
      {notificationData.length !== data.listsize && (
        <div className='text-bold text-center' style={{ color: '#778898', cursor: 'pointer', marginTop: 'auto', backgroundColor: '#fff', padding: '10px', borderTop: '2px solid #E5E7EB' }} onClick={handleLoadMore}>
          Load More
        </div>
      )}
    </Drawer>
  )
}
export default Notification
