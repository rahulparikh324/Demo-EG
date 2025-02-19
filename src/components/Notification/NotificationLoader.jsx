import React from 'react'
import Skeleton from '@material-ui/lab/Skeleton'

function NotificationLoader() {
  return (
    <>
      {[...Array(8)].map((x, index) => (
        <div key={index} className='p-3 border rounded mb-2'>
          <div className='d-flex align-items-center'>
            <Skeleton variant='circle' animation='wave' width={15} height={15} style={{ borderRadius: '10px' }} />
            <Skeleton variant='text' animation='wave' width={150} height={24} style={{ marginLeft: '14px' }} />
          </div>
          <div>
            <Skeleton variant='text' animation='wave' width={250} height={18} style={{ marginLeft: '29px' }} />
            <Skeleton variant='text' animation='wave' width={300} height={18} style={{ marginLeft: '29px' }} />
          </div>
        </div>
      ))}
    </>
  )
}

export default NotificationLoader
