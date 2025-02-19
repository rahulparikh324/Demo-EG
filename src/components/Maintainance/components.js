import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import AddIcon from '@material-ui/icons/Add'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import EditOutlinedIcon from '@material-ui/icons/EditOutlined'
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import Dialog from '@material-ui/core/Dialog'
import FormControl from '@material-ui/core/FormControl'
import clsx from 'clsx'
import _ from 'lodash'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { useTheme } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  root: { padding: 0, flexGrow: 1, height: 'calc(100vh - 64px)' },
  paper: { padding: theme.spacing(2), color: theme.palette.text.primary },
  buttonText: { fontSize: '12px', fontWeight: 400, transform: 'none' },
  pane: { borderRight: '2px solid #eee', height: '100%' },
  paneHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', padding: '12px' },
  button: { padding: '2px 14px', margin: theme.spacing(1), borderRadius: '12px', fontWeight: 800, margin: 0, textTransform: 'capitalize' },
  headerText: { fontSize: '16px', fontWeight: 800, width: '80%', fontFamily: 'EudoxusSans-Medium' },
  headerTextD: { fontSize: '13px', fontWeight: 400, width: '80%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  content: { padding: '0 10px' },
  formTitle: { background: theme.palette.primary.main, border: 'none', color: '#fff', width: '450px', fontSize: '16px', fontWeight: 500, padding: '17px 26px' },
  formButtons: { padding: '6px 18px', borderRadius: '40px' },
  bottomBar: { borderTop: '1px solid #A6A6A6', borderBottom: 'none', background: '#fff' },
  label: { padding: '3px 9px', borderRadius: '40px', color: '#fff', background: theme.palette.primary.main },
  paneItem: { padding: '8px 12px', fontSize: '14px', cursor: 'pointer', '&:hover': { background: '#0000000a' } },
  fS14: { fontSize: '14px' },
  activeTab: { color: '#fff', background: theme.palette.primary.main, '&:hover': { background: '#1d799a' } },
  activeLabel: { color: theme.palette.primary.main, background: '#fff' },
  emptyState: { textAlign: 'center', padding: '16px', color: '#a6a6a6' },
  input: { margin: '16px 16px 0 16px', width: '92%' },
  containerDiv: { display: 'flex', justifyContent: 'space-between', flexDirection: 'column', height: '100%' },
}))

export function Pane({ title, openFunc, xs, items, itemClick, accordian, children, disabled }) {
  const classes = useStyles()
  return (
    <div className='col-8 px-0'>
      <div className={classes.pane}>
        <div className={classes.paneHeader}>
          <div className={classes.headerText}>{title}</div>
          <Button variant='contained' color='primary' className={classes.button} onClick={openFunc} disabled={disabled} startIcon={<AddIcon />} disableElevation>
            New
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function CategoryList({ title, openFunc, xs, children, disabled }) {
  const classes = useStyles()
  return (
    <div className='col-2 px-0'>
      <div className={classes.pane}>
        <div className={classes.paneHeader}>
          <div className={classes.headerText}>{title}</div>
          <Button variant='contained' color='primary' className={classes.button} onClick={openFunc} disabled={disabled} startIcon={<AddIcon />} disableElevation>
            New
          </Button>
        </div>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: '840px', height: '840px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export function CategoryItem({ item, itemClick, title, count, reNameFunc, active, onDelete }) {
  const classes = useStyles()
  const [anchorEl, setAnchorEl] = useState(null)
  const reName = () => {
    setAnchorEl(null)
    reNameFunc()
  }
  const deleteItem = () => {
    setAnchorEl(null)
    onDelete()
  }
  return (
    <div style={{ paddingRight: 0 }} className={active ? clsx(classes.paneHeader, classes.paneItem, classes.activeTab) : clsx(classes.paneHeader, classes.paneItem)}>
      <div onClick={itemClick} className={clsx(classes.headerTextD, classes.fS14)}>
        {title}
      </div>
      <div className='d-flex'>
        <div onClick={itemClick} className={active ? clsx(classes.label, classes.fS14, classes.activeLabel) : clsx(classes.label, classes.fS14)} style={{ fontFamily: 'EudoxusSans-Regular', fontWeight: 800 }}>
          {count}
        </div>

        <IconButton aria-label='more' aria-controls='long-menu' aria-haspopup='true' onClick={e => setAnchorEl(e.currentTarget)} size='small'>
          <MoreVertIcon fontSize='small' />
        </IconButton>

        <Menu id='schedule-list-menu' anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => reName()}>Rename</MenuItem>
          {count === 0 && <MenuItem onClick={() => deleteItem()}>Delete</MenuItem>}
        </Menu>
      </div>
    </div>
  )
}

export function PlanItem({ item, active, itemClick, title, count, reNameFunc, onDelete, onMove, onDuplicate }) {
  const classes = useStyles()
  const [anchorEl, setAnchorEl] = useState(null)
  const reName = () => {
    setAnchorEl(null)
    reNameFunc()
  }
  const deleteItem = () => {
    setAnchorEl(null)
    onDelete()
  }
  const moveItem = () => {
    setAnchorEl(null)
    onMove()
  }
  const duplicate = () => {
    setAnchorEl(null)
    onDuplicate()
  }
  return (
    <div style={{ paddingRight: 0 }} className={active ? clsx(classes.paneHeader, classes.paneItem, classes.activeTab) : clsx(classes.paneHeader, classes.paneItem)}>
      <div onClick={itemClick} className={clsx(classes.headerTextD, classes.fS14)}>
        {title}
      </div>
      <div className='d-flex'>
        <div onClick={itemClick} className={active ? clsx(classes.label, classes.fS14, classes.activeLabel) : clsx(classes.label, classes.fS14)} style={{ fontFamily: 'EudoxusSans-Regular', fontWeight: 800 }}>
          {count}
        </div>

        <IconButton aria-label='more' aria-controls='long-menu' aria-haspopup='true' onClick={e => setAnchorEl(e.currentTarget)} size='small'>
          <MoreVertIcon fontSize='small' />
        </IconButton>

        <Menu id='schedule-list-menu' anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => reName()}>Rename</MenuItem>
          <MenuItem onClick={() => deleteItem()}>Delete</MenuItem>
          <MenuItem onClick={() => duplicate()}>Duplicate</MenuItem>
          <MenuItem onClick={() => moveItem()}>Move</MenuItem>
        </Menu>
      </div>
    </div>
  )
}

export function FormTitle({ title, closeFunc, style, isBlackIcon = false, onEdit, isEdit = false }) {
  const classes = useStyles()
  return (
    <div className={clsx(classes.paneHeader, classes.formTitle)} style={style}>
      <div style={{ fontWeight: 800 }}>{title}</div>
      <div>
        {isEdit && (
          <IconButton aria-label='close' size='small' onClick={onEdit}>
            <EditOutlinedIcon style={{ color: isBlackIcon ? '#000' : '#fff', marginRight: '5px' }} />
          </IconButton>
        )}
        <IconButton aria-label='close' size='small' onClick={closeFunc}>
          <CloseIcon style={{ color: isBlackIcon ? '#000' : '#fff' }} />
        </IconButton>
      </div>
    </div>
  )
}

export function BottomBar({ onClose, buttonText, submitFunc, showIcon }) {
  const classes = useStyles()
  return (
    <div className={clsx(classes.paneHeader, classes.bottomBar)}>
      <Button variant='contained' color='default' className='nf-buttons' disableElevation onClick={onClose}>
        Cancel
      </Button>
      <Button variant='contained' color='primary' className='nf-buttons' onClick={submitFunc} startIcon={showIcon ? <AddIcon /> : null} disableElevation>
        {buttonText}
      </Button>
    </div>
  )
}

export function TaskItem({ noDelete, code, title, time, onDelete }) {
  return (
    <div className='schedule-task-item'>
      <div className='task-item-detail'>
        <div>{code}</div>
        <div>{title}</div>
      </div>
      <div className='task-item-time'>
        <span>Est Time: {time}</span>
        {!noDelete && (
          <IconButton size='small' onClick={onDelete}>
            <DeleteOutlineOutlinedIcon fontSize='small' style={{ color: '#FF0000' }} />
          </IconButton>
        )}
      </div>
    </div>
  )
}
export function AttachmentItem({ noDelete, name, onDelete, url }) {
  return (
    <div className='attachment-item'>
      <a className='attachment-item-detail' href={url} target='_blank'>
        {name}
      </a>
      <div className='task-item-time'>
        {!noDelete && (
          <IconButton size='small' onClick={onDelete}>
            <DeleteOutlineOutlinedIcon fontSize='small' style={{ color: '#FF0000' }} />
          </IconButton>
        )}
      </div>
    </div>
  )
}

export function EmptyState({ text }) {
  const classes = useStyles()
  return <div className={classes.emptyState}> {text} </div>
}

export function DeleteDailog({ open, handleClose, onDelete, title, text, duplicate }) {
  //const classes = useStyles()
  return (
    <div>
      <Dialog open={open} aria-labelledby='draggable-dialog-title'>
        {title}
        {text}
        <Button onClick={handleClose} variant='contained' color='default' className='nf-buttons' disableElevation>
          Cancel
        </Button>
        <Button onClick={onDelete} variant='contained' color='primary' className='nf-buttons' disableElevation>
          {duplicate ? 'Duplicate' : 'Delete'}
        </Button>
      </Dialog>
    </div>
  )
}

export function ContainerDiv({ children }) {
  const classes = useStyles()
  return <div className={classes.containerDiv}> {children} </div>
}
export function FormControlVariant({ children }) {
  const classes = useStyles()
  return (
    <FormControl variant='outlined' className={classes.input}>
      {children}
    </FormControl>
  )
}
export function FormAccordian({ title, extra, progress, children, error, style, bg, count, keepOpen }) {
  const [expand, setExpand] = useState(keepOpen || false)
  const theme = useTheme()
  return (
    <div style={style}>
      <div className='form-acc-title p-3 d-flex flex-row justify-content-between align-items-center' style={error ? { background: '#ffdede', borderRadius: '4px', border: '1px solid red' } : bg ? { background: '#fff', borderRadius: '4px' } : {}} onClick={() => setExpand(!expand)}>
        <span style={error ? { color: '#f11846', width: '100%' } : { width: '100%' }}>
          <span className='acc-cont-title'>
            {title}
            {count > 0 && <span style={{ fontSize: '11px', color: '#fff', padding: '3px 9px', background: theme.palette.primary.main, borderRadius: '40px', marginLeft: '8px' }}>{count}</span>}
            {progress}
            {error && <div style={{ marginLeft: '24px', color: 'red' }}>{error.msg}</div>}
          </span>
          <div>{extra}</div>
        </span>
        {expand ? (
          <span className='acc-cont-icon' style={{ background: theme.palette.primary.main }}>
            <ExpandLessIcon fontSize='small' onClick={() => setExpand(!expand)} style={{ color: '#fff' }} />
          </span>
        ) : (
          <span className='acc-cont-icon' style={{ background: theme.palette.primary.main }}>
            <ExpandMoreIcon fontSize='small' onClick={() => setExpand(!expand)} style={{ color: '#fff' }} />
          </span>
        )}
      </div>
      <div className={`active-${expand}`}>{children}</div>
    </div>
  )
}

export const StatusControl = ({ onClick, icon, title, active }) => {
  const theme = useTheme()

  return (
    <div className={`p-3 d-flex flex-column justify-content-between align-items-center status-control status-control-${active}`} style={{ background: active ? theme.palette.primary.main : '#fff', color: !active ? theme.palette.primary.main : '#fff' }} onClick={onClick}>
      {icon}
      {title}
    </div>
  )
}
