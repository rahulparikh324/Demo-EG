import React from 'react'

import { generateAvatarColor } from 'components/Issues/utlis'

export const InformationContainer = ({ icon, label, children }) => (
  <div className='d-flex my-4' style={{ width: '100%' }}>
    <div style={{ width: '30%' }}>
      <div className='d-flex align-items-center'>
        {icon}
        <div className='text-bold ml-2' style={{ color: '#606060' }}>
          {label}
        </div>
      </div>
    </div>
    <div>{children}</div>
  </div>
)

const informationStyle = {
  backgroundColor: '#778899',
  padding: '5px 10px',
  color: '#ffffff',
  borderRadius: '5px',
  // fontWeight: 'bold',
  // width: '200px',
}
export const NewInformationContainer = ({ icon, label, style }) => (
  <div className='d-flex my-4' style={{ ...informationStyle, ...style }}>
    <div>
      <div className='d-flex align-items-center' style={{ color: '#ffffff' }}>
        {icon}
        <div className='ml-2 text-bold' style={{ color: '#ffffff' }}>
          {label}
        </div>
      </div>
    </div>
  </div>
)

export const Avatar = ({ firstName, lastName, style }) => (
  <div className='d-flex justify-content-center align-items-center text-bold' style={{ width: '85px', height: '85px', background: `${generateAvatarColor({ firstName, lastName })}`, borderRadius: '8px', color: '#fff', fontSize: '24px', ...style }}>
    {firstName && firstName[0].toUpperCase()}
    {lastName && lastName[0].toUpperCase()}
  </div>
)

export const Info = ({ label, value }) => (
  <>
    <div className='text-bold mt-3'>{label}</div>
    <div>{value}</div>
  </>
)
