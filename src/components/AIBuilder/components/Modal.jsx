// src/components/Modal.jsx
import React from 'react'
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@material-ui/core'

const Modal = ({ show, onClose, onConfirm, children }) => {
  return (
    <Dialog open={show} onClose={onClose}>
      <DialogTitle>Confirmation</DialogTitle>
      <DialogContent>
        <DialogContentText>{children}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onConfirm} color='primary'>
          Yes
        </Button>
        <Button onClick={onClose} color='primary' autoFocus>
          No
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default Modal
