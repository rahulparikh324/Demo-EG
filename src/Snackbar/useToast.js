import React from 'react'
import toast from 'react-hot-toast'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import ReportProblemOutlinedIcon from '@material-ui/icons/ReportProblemOutlined'

export const Toast = {
  success: msg =>
    toast.success(
      t => (
        <div className='toast-div success'>
          <div className='d-flex flex-row justify-content-between align-items-center'>
            {/* <div className='toast-title'>Success !</div> */}
            <div className='toast-msg'>{msg}</div>
            <IconButton className='toast-close' aria-label='close' size='small' onClick={() => toast.dismiss(t.id)}>
              <CloseIcon />
            </IconButton>
          </div>
        </div>
      ),
      {
        duration: 10000,
        position: 'top-right',
      }
    ),
  error: (msg, id = null) =>
    toast.error(
      t => (
        <div className='toast-div success'>
          <div className='d-flex flex-row justify-content-between align-items-center'>
            {/* <div className='toast-title'>Error !</div> */}
            <div className='toast-msg'>{msg}</div>
            <IconButton className='toast-close' aria-label='close' size='small' onClick={() => toast.dismiss(t.id)}>
              <CloseIcon />
            </IconButton>
          </div>
        </div>
      ),
      {
        duration: 10000,
        position: 'top-right',
        ...(id && { id }),
      }
    ),
  warning: (msg, id = null) =>
    toast(
      t => (
        <div className='toast-div success'>
          <div className='d-flex flex-row justify-content-between align-items-center mb-1'>
            <div className='d-flex align-items-center'>
              <ReportProblemOutlinedIcon style={{ color: '#fb6944' }} />
              <div className='toast-title ml-2'>Warning !</div>
            </div>
            <IconButton className='toast-close' aria-label='close' size='small' onClick={() => toast.dismiss(t.id)}>
              <CloseIcon />
            </IconButton>
          </div>
          <div className='toast-msg'>{msg}</div>
        </div>
      ),
      {
        duration: 10000,
        position: 'top-right',
        ...(id && { id }),
      }
    ),
  info: msg =>
    toast(
      t => (
        <div className='toast-div success'>
          <div className='d-flex flex-row justify-content-between align-items-center'>
            {/* <div className='toast-title'>Error !</div> */}
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width={25} height={25}>
              <path d='M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 11V17H13V11H11ZM11 7V9H13V7H11Z' fill='rgba(6,129,255,1)'></path>
            </svg>
            <div className='toast-msg ml-2'>{msg}</div>
            <IconButton className='toast-close' aria-label='close' size='small' onClick={() => toast.dismiss(t.id)}>
              <CloseIcon />
            </IconButton>
          </div>
        </div>
      ),
      {
        duration: 10000,
        position: 'top-right',
      }
    ),
}
