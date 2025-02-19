import React from 'react'
import Dialog from '@material-ui/core/Dialog'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import { makeStyles } from '@material-ui/core/styles'
import CloseIcon from '@material-ui/icons/Close'
import CircularProgress from '@material-ui/core/CircularProgress'

const useStyles = makeStyles(theme => ({
  title: { fontSize: '15px', fontWeight: 800, fontFamily: 'EudoxusSans-Medium' },
}))

function DialogPrompt({ open, handleClose, action, title, text, ctaText, actionLoader }) {
  const classes = useStyles()
  return (
    <div>
      <Dialog open={open} aria-labelledby='draggable-dialog-title'>
        <div className='d-flex flex-row justify-content-between align-items-center px-3 py-2' style={{ width: '400px', background: '#e0e0e080' }}>
          <div className={classes.title}>{title}</div>
          <IconButton onClick={handleClose} size='small'>
            <CloseIcon fontSize='small' />
          </IconButton>
        </div>
        <div className='px-3 py-2' style={{ width: '400px' }}>
          {text}
        </div>
        <div className='d-flex flex-row justify-content-end align-items-center px-3 pt-4 pb-3' style={{ width: '400px' }}>
          <Button onClick={handleClose} variant='contained' color='default' className='nf-buttons' disableElevation style={{ marginRight: '15px' }}>
            Cancel
          </Button>
          <Button onClick={action} variant='contained' color='primary' className='nf-buttons' disableElevation disabled={actionLoader}>
            {ctaText} {actionLoader && <CircularProgress size={20} thickness={5} style={{ color: '#fff', marginLeft: '10px' }} />}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}

export default DialogPrompt
