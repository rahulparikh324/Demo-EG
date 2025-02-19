import React from 'react'
import { withStyles } from '@material-ui/core/styles'

import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import LanguageOutlinedIcon from '@material-ui/icons/LanguageOutlined'
import EventSeatOutlinedIcon from '@material-ui/icons/EventSeatOutlined'
import AssessmentOutlinedIcon from '@material-ui/icons/AssessmentOutlined'
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm'
import VerticalSplitOutlinedIcon from '@material-ui/icons/VerticalSplitOutlined'
import PersonOutlineIcon from '@material-ui/icons/PersonOutline'
import { Tooltip } from '@material-ui/core'

const HtmlTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: '#fff',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 400,
    maxHeight: 400,
    fontSize: theme.typography.pxToRem(13),
    border: '1px solid #dadde9',
  },
}))(Tooltip)

export const FlagItem = ({ icon, title, descriptions, style, onChange, isCheck, key, isLoading }) => {
  const IOSSwitch = withStyles(theme => ({
    root: {
      width: 50,
      height: 26,
      padding: 0,
      //   margin: theme.spacing(1),
    },
    switchBase: {
      padding: 1,
      '&$checked': {
        transform: 'translateX(24px)',
        color: theme.palette.common.white,
        '& + $track': {
          backgroundColor: '#778899',
          opacity: 1,
          border: 'none',
        },
      },
      '&$focusVisible $thumb': {
        color: '#52d869',
        border: '6px solid #fff',
      },
    },
    thumb: {
      width: 24,
      height: 24,
    },
    track: {
      borderRadius: 26 / 2,
      border: `1px solid ${theme.palette.grey[400]}`,
      backgroundColor: '#EFEFEF',
      opacity: 1,
      transition: theme.transitions.create(['background-color', 'border']),
    },
    checked: {},
    focusVisible: {},
  }))(({ classes, ...props }) => {
    return (
      <Switch
        focusVisibleClassName={classes.focusVisible}
        disableRipple
        classes={{
          root: classes.root,
          switchBase: classes.switchBase,
          thumb: classes.thumb,
          track: classes.track,
          checked: classes.checked,
        }}
        {...props}
      />
    )
  })

  return (
    <div className='p-2' style={style} key={key}>
      <div className='d-flex justify-content-between'>
        <HtmlTooltip title={descriptions} placement='top' enterDelay={2000} leaveDelay={100}>
          <h6 className='text-bold mt-2' style={{ letterSpacing: 1 }}>
            {title}
          </h6>
        </HtmlTooltip>
        <FormControlLabel control={<IOSSwitch checked={isCheck} onChange={onChange} />} />
      </div>
    </div>
  )
}

export const showIcons = name => {
  let icon
  const style = {
    fontSize: '30px',
  }

  switch (name) {
    case 'session_management_multi_browser':
      icon = <LanguageOutlinedIcon style={style} />
      break
    case 'egalvanic_ai':
      icon = <EventSeatOutlinedIcon style={style} />
      break
    case 'generate_ir_report_for_all_assets':
      icon = <AssessmentOutlinedIcon style={style} />
      break
    case 'estimator':
      icon = <AccessAlarmIcon style={style} />
      break
    case 'allowed_to_update_formio':
      icon = <VerticalSplitOutlinedIcon style={style} />
      break
    case 'hide_egalvanic_users':
      icon = <PersonOutlineIcon style={style} />
      break
  }

  return icon
}
