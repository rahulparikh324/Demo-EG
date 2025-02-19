import React, { useState, useEffect, useRef } from 'react'

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import PersonOutlineOutlinedIcon from '@material-ui/icons/PersonOutlineOutlined'
import ExitToAppOutlinedIcon from '@material-ui/icons/ExitToAppOutlined'

import { generateAvatarColor } from 'components/Issues/utlis'
import { AssetImage } from 'components/WorkOrders/onboarding/utils'

import { camelizeKeys } from 'helpers/formatters'
import { get, isEmpty } from 'lodash'
import { history } from 'helpers/history'
import './components.css'

const UserMenu = ({ selectedRole }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const userInfo = camelizeKeys(JSON.parse(localStorage.getItem('loginData')))
  const [userObj, setUserObj] = useState(isEmpty(JSON.parse(localStorage.getItem('userObj'))) ? { firstname: get(userInfo, 'firstname', ''), lastname: get(userInfo, 'lastname', ''), profilePictureUrl: get(userInfo, 'profilePictureUrl', ''), profilePictureName: get(userInfo, 'profilePictureName', '') } : JSON.parse(localStorage.getItem('userObj')))
  //console.log(userObj)
  const handleClickOutside = event => {
    if (ref.current && !ref.current.contains(event.target)) setOpen(false)
  }
  const handleChangeInUserObj = () => {
    if (!isEmpty(JSON.parse(localStorage.getItem('userObj')))) setUserObj(JSON.parse(localStorage.getItem('userObj')))
  }
  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true)
    window.addEventListener('storage', handleChangeInUserObj, true)
    return () => {
      document.removeEventListener('click', handleClickOutside, true)
      window.removeEventListener('storage', handleChangeInUserObj, true)
    }
  }, [])

  const Avatar = ({ firstName, lastName }) => (
    <div className='d-flex justify-content-center align-items-center text-bold' style={{ width: '40px', height: '40px', background: `${generateAvatarColor({ firstName, lastName })}`, borderRadius: '4px', color: '#fff' }}>
      {firstName && firstName[0].toUpperCase()}
      {lastName && lastName[0].toUpperCase()}
    </div>
  )

  const viewProfile = () => history.push('/profile')
  const logOut = async () => {
    try {
      const domainName = localStorage.getItem('domainName')
      localStorage.clear()
      localStorage.setItem('domainName', domainName)
      history.push('/login')
    } catch (error) {
      console.log(error)
      history.push('/login')
    }
  }
  const menuOptions = [
    { id: 1, type: 'button', text: 'Profile', onClick: viewProfile, icon: <PersonOutlineOutlinedIcon />, disabled: selectedRole === 'Executive' },
    { id: 2, type: 'button', text: 'Log Out', onClick: logOut, icon: <ExitToAppOutlinedIcon />, disabled: false },
  ]

  return (
    <div style={{ position: 'relative' }}>
      <div className='d-flex user-menu' onClick={() => setOpen(true)} style={{ cursor: 'pointer' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '45px auto 20px', rowGap: '10px', padding: '8px 0', alignItems: 'center' }}>
          {isEmpty(get(userObj, 'profilePictureName', '')) ? <Avatar firstName={get(userObj, 'firstname', '')} lastName={get(userObj, 'lastname', '')} /> : <AssetImage width='40px' readOnly url={get(userObj, 'profilePictureUrl', '')} randomValue />}
          <div>
            <div className='text-bold'>
              {get(userObj, 'firstname', '')} {get(userObj, 'lastname', '')}
            </div>
            <div style={{ fontSize: '12px' }}>{get(userInfo, 'email', '')}</div>
          </div>
          <div>
            <ArrowDropDownIcon />
          </div>
        </div>
      </div>
      {open && (
        <div ref={ref} className='rd-pop-up-container' style={{ top: '54px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '45px auto', rowGap: '10px', padding: '12px', alignItems: 'center' }}>
            {isEmpty(get(userObj, 'profilePictureName', '')) ? <Avatar firstName={get(userObj, 'firstname', '')} lastName={get(userObj, 'lastname', '')} /> : <AssetImage width='40px' readOnly url={get(userObj, 'profilePictureUrl', '')} randomValue />}
            <div>
              <div className='text-bold' style={{ color: '#606060' }}>
                {get(userObj, 'firstname', '')} {get(userObj, 'lastname', '')}
              </div>
              <div style={{ fontSize: '12px', color: '#ccc' }}>{get(userInfo, 'email', '')}</div>
            </div>
          </div>
          {menuOptions.map(item => {
            return (
              <div key={item.id} style={{ borderTop: '1px solid #eee' }}>
                {!item.disabled && (
                  <button
                    id='_menu-item'
                    onClick={() => {
                      setOpen(false)
                      item.onClick()
                    }}
                    style={{ padding: '10px 14px' }}
                  >
                    {item.icon} <span style={{ marginLeft: '8px', fontSize: '14px' }}>{item.text}</span>
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default UserMenu
